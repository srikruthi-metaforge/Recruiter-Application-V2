import { RecruiterLoginRecord } from './types'
import { LOGIN_RECORDS_TODAY } from './loginRecords.today'
import { LOGIN_RECORDS_YESTERDAY } from './loginRecords.yesterday'
import { LOGIN_RECORDS_EARLIER } from './loginRecords.earlier'

export const INITIAL_LOGIN_RECORDS: RecruiterLoginRecord[] = [
  ...LOGIN_RECORDS_TODAY,
  ...LOGIN_RECORDS_YESTERDAY,
  ...LOGIN_RECORDS_EARLIER,
]
