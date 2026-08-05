import { ApiProperty } from '@nestjs/swagger';

export class OrganisationSummaryResponseDto {
  @ApiProperty({ example: 'clx789ghi012jkl' })
  id: string;

  @ApiProperty({ example: 'Acme Corp' })
  name: string;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-31T10:00:00.000Z' })
  updatedAt: Date;
}

export class OrganisationListResponseDto {
  @ApiProperty({ type: [OrganisationSummaryResponseDto] })
  organisations: OrganisationSummaryResponseDto[];
}
