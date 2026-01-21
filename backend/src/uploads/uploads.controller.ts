import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadsService, StorageBucket } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private uploadsService: UploadsService) { }

    @Post('inventory/:shopId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload inventory item image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadInventoryImage(
        @Param('shopId') shopId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const result = await this.uploadsService.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            StorageBucket.INVENTORY_IMAGES,
            shopId,
        );

        return {
            success: true,
            url: result.url,
            path: result.path,
        };
    }

    @Post('inventory/:shopId/multiple')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload multiple inventory images' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultipleInventoryImages(
        @Param('shopId') shopId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        const results = await this.uploadsService.uploadMultiple(
            files.map(f => ({
                buffer: f.buffer,
                originalName: f.originalname,
                mimeType: f.mimetype,
            })),
            StorageBucket.INVENTORY_IMAGES,
            shopId,
        );

        return {
            success: true,
            images: results.map(r => ({
                url: r.url,
                path: r.path,
            })),
        };
    }

    @Post('shop/:shopId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload shop photo' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadShopPhoto(
        @Param('shopId') shopId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const result = await this.uploadsService.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            StorageBucket.SHOP_PHOTOS,
            shopId,
        );

        return {
            success: true,
            url: result.url,
            path: result.path,
        };
    }
}
