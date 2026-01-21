import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) { }

    @Get()
    @ApiOperation({ summary: 'Search inventory items' })
    async search(
        @Query('q') query: string = '',
        @Query('category') category?: string,
        @Query('size') size?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('locality') locality?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.searchService.search(query, {
            category,
            size,
            minPrice,
            maxPrice,
            locality,
            page,
            limit,
        });
    }

    @Get('suggestions')
    @ApiOperation({ summary: 'Get search suggestions' })
    async suggestions(@Query('q') query: string) {
        return this.searchService.getSuggestions(query);
    }
}
