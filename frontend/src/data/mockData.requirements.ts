import { Requirement } from '../types'
import { INITIAL_REQUIREMENTS_INTERNAL } from './mockData.requirements-internal'
import { INITIAL_REQUIREMENTS_CLIENTS } from './mockData.requirements-clients'

export const INITIAL_REQUIREMENTS: Requirement[] = [
  ...INITIAL_REQUIREMENTS_INTERNAL,
  ...INITIAL_REQUIREMENTS_CLIENTS,
]
