import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class SyncAllDto {
	@ApiProperty({ example: 10, description: "The product count" })
	@IsInt()
	@Min(1)
	productCount: number;

	@ApiProperty({ example: 10, description: "The customer count" })
	@IsInt()
	@Min(1)
	customerCount: number;

	@ApiProperty({ example: 10, description: "The order count" })
	@IsInt()
	@Min(1)
	orderCount: number;
}
