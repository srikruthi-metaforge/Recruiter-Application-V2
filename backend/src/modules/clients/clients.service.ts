import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { ClientRepository } from './repositories/client.repository';
import { Requirement, RequirementDocument } from '../requirements/schemas/requirement.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Requirement.name)
    private readonly requirementModel: Model<RequirementDocument>,
    private readonly clientRepository: ClientRepository,
  ) {}

  /** Format document for API output */
  private sanitizeClient(doc: any) {
    const obj = doc.toObject ? doc.toObject() : doc;

    const nameVal = obj.clientName || obj.name || 'N/A';
    const domainVal = obj.domain || obj.industry || 'Information Technology';
    const pocList = Array.isArray(obj.pocContacts) && obj.pocContacts.length > 0
      ? obj.pocContacts
      : (Array.isArray(obj.contactPersons) ? obj.contactPersons : []);

    const accountLeadObj = obj.accountLeadId && typeof obj.accountLeadId === 'object' ? obj.accountLeadId : null;

    return {
      ...obj,
      id: obj._id ? obj._id.toString() : obj.id,
      clientId: obj.clientId || `CLIENT-${obj._id ? obj._id.toString().substring(18) : '000'}`,
      clientName: nameVal,
      name: nameVal,
      domain: domainVal,
      industry: domainVal,
      tier: obj.tier || 'Tier-1',
      status: obj.status || 'Active',
      slaDays: typeof obj.slaDays === 'number' ? obj.slaDays : 5,
      pocContacts: pocList,
      contactPersons: pocList,
      accountLeadId: accountLeadObj ? accountLeadObj._id.toString() : (obj.accountLeadId?.toString() || null),
      accountLeadName: accountLeadObj?.name || 'N/A',
      deliveryGapScore: typeof obj.deliveryGapScore === 'number' ? obj.deliveryGapScore : 0.0,
      agreementsUrl: obj.agreementsUrl || null,
      createdAt: obj.createdAt || new Date(),
      updatedAt: obj.updatedAt || new Date(),
    };
  }

  /** Generate CLIENT-XXX sequence code */
  async generateClientId(orgId: Types.ObjectId): Promise<string> {
    const regex = /^CLIENT-(\d+)$/i;
    const latest = await this.clientModel
      .find({ orgId, clientId: regex })
      .sort({ clientId: -1 })
      .limit(1)
      .exec();

    let seq = 1;
    if (latest && latest.length > 0) {
      const parts = latest[0].clientId.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    } else {
      const count = await this.clientModel.countDocuments({ orgId }).exec();
      seq = count + 1;
    }

    return `CLIENT-${String(seq).padStart(3, '0')}`;
  }

  /** GET /api/v1/clients */
  async findAll(
    currentUser: any,
    query?: {
      search?: string;
      status?: string;
      tier?: string;
      domain?: string;
    },
  ) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const filter: Record<string, any> = { orgId, deletedAt: null };

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.tier) {
      filter.tier = query.tier;
    }

    if (query?.domain) {
      const domainRegex = new RegExp(query.domain.trim(), 'i');
      filter.$or = [{ domain: domainRegex }, { industry: domainRegex }];
    }

    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { clientName: regex },
        { clientId: regex },
        { domain: regex },
        { industry: regex },
      ];
    }

    const items = await this.clientModel
      .find(filter)
      .populate('accountLeadId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return items.map((item) => this.sanitizeClient(item));
  }

  /** GET /api/v1/clients/:id */
  async findById(id: string, currentUser: any) {
    let doc: ClientDocument | null = null;

    if (Types.ObjectId.isValid(id)) {
      doc = await this.clientModel
        .findOne({ _id: id, deletedAt: null })
        .populate('accountLeadId', 'name email')
        .exec();
    }

    if (!doc) {
      doc = await this.clientModel
        .findOne({ clientId: id, deletedAt: null })
        .populate('accountLeadId', 'name email')
        .exec();
    }

    if (!doc) {
      throw new NotFoundException(`Client '${id}' not found`);
    }

    const sanitized = this.sanitizeClient(doc);

    // Fetch requirements count for client
    const requirementsCount = await this.requirementModel
      .countDocuments({ clientId: doc._id, deletedAt: null })
      .exec();

    return {
      ...sanitized,
      requirementsCount,
    };
  }

  /** POST /api/v1/clients */
  async create(dto: CreateClientDto, currentUser: any) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const cleanName = dto.clientName.trim();
    const nameRegex = new RegExp(`^${cleanName}$`, 'i');

    const existing = await this.clientModel.findOne({
      orgId,
      deletedAt: null,
      $or: [{ clientName: nameRegex }],
    }).exec();

    if (existing) {
      throw new ConflictException(`Client with name '${cleanName}' already exists`);
    }

    const clientId = await this.generateClientId(orgId);

    const accountLeadId = dto.accountLeadId && Types.ObjectId.isValid(dto.accountLeadId)
      ? (new Types.ObjectId(dto.accountLeadId) as any)
      : null;

    const newClient = new this.clientModel({
      orgId,
      clientId,
      clientName: cleanName,
      domain: dto.domain || 'Information Technology',
      tier: dto.tier || 'Tier-1',
      status: dto.status || 'Active',
      slaDays: dto.slaDays || 5,
      pocContacts: dto.pocContacts || [],
      contactPersons: dto.pocContacts || [],
      accountLeadId,
      agreementsUrl: dto.agreementsUrl || null,
    });

    const saved = await newClient.save();
    return this.findById(saved._id.toString(), currentUser);
  }

  /** PUT /api/v1/clients/:id */
  async update(id: string, dto: UpdateClientDto, currentUser: any) {
    let doc: ClientDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.clientModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.clientModel.findOne({ clientId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Client '${id}' not found`);
    }

    if (dto.clientName !== undefined) {
      const cleanName = dto.clientName.trim();
      const nameRegex = new RegExp(`^${cleanName}$`, 'i');
      const existing = await this.clientModel.findOne({
        orgId: doc.orgId,
        _id: { $ne: doc._id },
        deletedAt: null,
        $or: [{ clientName: nameRegex }],
      }).exec();

      if (existing) {
        throw new ConflictException(`Another client with name '${cleanName}' already exists`);
      }

      doc.clientName = cleanName;
    }

    if (dto.domain !== undefined) doc.domain = dto.domain;
    if (dto.tier !== undefined) doc.tier = dto.tier;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.slaDays !== undefined) doc.slaDays = dto.slaDays;
    if (dto.deliveryGapScore !== undefined) doc.deliveryGapScore = dto.deliveryGapScore;
    if (dto.agreementsUrl !== undefined) doc.agreementsUrl = dto.agreementsUrl;

    if (dto.pocContacts !== undefined) {
      doc.pocContacts = dto.pocContacts;
      (doc as any).contactPersons = dto.pocContacts;
    }

    if (dto.accountLeadId !== undefined) {
      doc.accountLeadId = dto.accountLeadId && Types.ObjectId.isValid(dto.accountLeadId)
        ? (new Types.ObjectId(dto.accountLeadId) as any)
        : null;
    }

    const updated = await doc.save();
    return this.findById(updated._id.toString(), currentUser);
  }

  /** DELETE /api/v1/clients/:id */
  async softDelete(id: string, currentUser: any) {
    let targetId: string = id;
    if (!Types.ObjectId.isValid(id)) {
      const doc = await this.clientModel.findOne({ clientId: id, deletedAt: null }).exec();
      if (!doc) throw new NotFoundException(`Client '${id}' not found`);
      targetId = doc._id.toString();
    }

    const deleted = await this.clientRepository.softDelete(targetId, currentUser);
    return { message: `Client '${deleted.clientId || targetId}' soft-deleted successfully` };
  }
}
