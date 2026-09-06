export const profiles: string[]
export interface Fixture {
  source: string
  profile: string
  kib: number
  copies: number
  bytes: number
  required: string[]
  expectedCounts: Record<string, number>
}
export function makeFixture(profile?: string, kib?: number): Fixture
