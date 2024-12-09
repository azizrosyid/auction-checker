import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { mockArthaAbi, mockArthaAddress, mockOracleAbi } from 'src/generated';
import axios from 'axios';

// The Position type should be declared outside the method for clarity
type Position = {
  id: string;
  tokenId: string;
  pool: {
    oracle: string;
    totalBorrowShares: number;
    totalBorrowAssets: number;
  };

  borrowShares: number;
};

type ResponseGetAllLiquidatable = {
  isLiquidatableStatus: boolean;
  position: Position;
  floorPrice: string;
  debt: string;
};

@Controller()
export class AppController {
  client: any;

  constructor(private readonly appService: AppService) {
    this.client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
  }

  // Refactored isLiquidatable as async function
  async isLiquidatable(position: Position): Promise<boolean> {
    try {
      const [poolId, tokenId] = position.id.split('-');
      const isLiquidated = await this.client.readContract({
        abi: mockArthaAbi,
        address: mockArthaAddress[84532],
        functionName: 'unhealthyList',
        args: [poolId, tokenId],
      });

      return isLiquidated; // You may need to parse the result if it's not boolean
    } catch (error) {
      console.error('Error checking liquidatable status:', error);
      return false; // Default to false if there's an error
    }
  }

  async getPrice(oracleAddress: string, tokenId: bigint): Promise<number> {
    try {
      const price = await this.client.readContract({
        abi: mockOracleAbi,
        address: oracleAddress,
        functionName: 'getPrice',
        args: [tokenId],
      });

      return price; // You may need to parse the result if it's not a number
    } catch (error) {
      console.error('Error fetching price:', error);
      return 0; // Default to 0 if there's an error
    }
  }

  @Get()
  async getHello(): Promise<ResponseGetAllLiquidatable[]> {
    const url =
      'https://api.studio.thegraph.com/query/92452/artha-finance-mock/version/latest';
    const token = 'da331587be6a9a9c264bf5ec9f21b54b';

    const data = {
      query: `{
        positions(first: 1000) {
          id
          tokenId
          pool {
            oracle
            totalBorrowShares
            totalBorrowAssets
          }
          borrowShares
        }
      }`,
    };

    try {
      // Fetching data using axios with async/await
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const positions: Position[] = response.data.data.positions;

      const result: ResponseGetAllLiquidatable[] = [];

      for (const position of positions) {
        const isLiquidatableStatus = await this.isLiquidatable(position);
        if (isLiquidatableStatus) {
          const price = await this.getPrice(
            position.pool.oracle,
            BigInt(position.tokenId),
          );

          const debt =
            (position.borrowShares / position.pool.totalBorrowShares) *
            position.pool.totalBorrowAssets;

          console.log('Price:', price);
          result.push({
            isLiquidatableStatus,
            position,
            floorPrice: price.toString(),
            debt: debt.toString(),
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error; // Rethrow the error to be caught by the error handler
    }
  }
}
