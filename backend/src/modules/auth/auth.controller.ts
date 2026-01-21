import { Controller, Post, Get, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('user/send-otp')
    @ApiOperation({ summary: 'Send OTP to user phone' })
    async sendUserOTP(@Body('phone') phone: string) {
        return this.authService.sendOTP(phone, 'user');
    }

    @Post('user/verify-otp')
    @ApiOperation({ summary: 'Verify user OTP and login' })
    async verifyUserOTP(
        @Body('phone') phone: string,
        @Body('otp') otp: string,
    ) {
        return this.authService.verifyUserOTP(phone, otp);
    }

    @Post('shop/send-otp')
    @ApiOperation({ summary: 'Send OTP to shop owner phone' })
    async sendShopOTP(@Body('phone') phone: string) {
        return this.authService.sendOTP(phone, 'shop');
    }

    @Post('shop/verify-otp')
    @ApiOperation({ summary: 'Verify shop OTP and login' })
    async verifyShopOTP(
        @Body('phone') phone: string,
        @Body('otp') otp: string,
    ) {
        return this.authService.verifyShopOTP(phone, otp);
    }

    @Get('admin/users')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: List all users' })
    async getAllUsers(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.authService.getAllUsers(page, limit);
    }

    // ============================================
    // NEW: Password-Based Authentication
    // ============================================

    @Post('shop/register')
    @ApiOperation({ summary: 'Register shop with email + password' })
    async registerShop(@Body() data: {
        name: string;
        ownerName: string;
        ownerPhone: string;
        email: string;
        password: string;
        address: string;
        locality: string;
        city?: string;
        pincode: string;
        lat: number;
        lng: number;
    }) {
        return this.authService.registerShop(data);
    }

    @Post('shop/verify-email')
    @ApiOperation({ summary: 'Verify email with OTP' })
    async verifyEmail(
        @Body('email') email: string,
        @Body('otp') otp: string,
    ) {
        return this.authService.verifyEmailOTP(email, otp);
    }

    @Post('shop/login')
    @ApiOperation({ summary: 'Login with phone + password' })
    async loginWithPassword(
        @Body('phone') phone: string,
        @Body('password') password: string,
    ) {
        return this.authService.loginWithPassword(phone, password);
    }

    @Post('shop/login-email')
    @ApiOperation({ summary: 'Login with email + OTP (backup method)' })
    async loginWithEmailOTP(
        @Body('email') email: string,
        @Body('otp') otp: string,
    ) {
        return this.authService.loginWithEmailOTP(email, otp);
    }

    @Post('shop/send-email-otp')
    @ApiOperation({ summary: 'Send OTP to email' })
    async sendEmailOTP(@Body('email') email: string) {
        return this.authService.sendEmailOTP(email);
    }

    @Post('shop/resend-otp')
    @ApiOperation({ summary: 'Resend verification OTP to email' })
    async resendShopOTP(@Body('email') email: string) {
        return this.authService.sendEmailOTP(email);
    }

    @Post('shop/forgot-password')
    @ApiOperation({ summary: 'Forgot password - send OTP to email' })
    async forgotPassword(@Body('phone') phone: string) {
        return this.authService.forgotPassword(phone);
    }

    @Post('shop/reset-password')
    @ApiOperation({ summary: 'Reset password with email OTP' })
    async resetPassword(
        @Body('email') email: string,
        @Body('otp') otp: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.authService.resetPassword(email, otp, newPassword);
    }

    // ============================================
    // USER Authentication (Email + Password)
    // ============================================

    @Post('user/register')
    @ApiOperation({ summary: 'Register user with email + password' })
    async registerUser(@Body() data: {
        name: string;
        email: string;
        phone: string;
        password: string;
        city?: string;
    }) {
        return this.authService.registerUser(data);
    }

    @Post('user/verify-email')
    @ApiOperation({ summary: 'Verify user email with OTP' })
    async verifyUserEmail(
        @Body('email') email: string,
        @Body('otp') otp: string,
    ) {
        return this.authService.verifyUserEmailOTP(email, otp);
    }

    @Post('user/login')
    @ApiOperation({ summary: 'User login with email + password' })
    async loginUser(
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return this.authService.loginUserWithPassword(email, password);
    }

    @Post('user/send-email-otp')
    @ApiOperation({ summary: 'Send OTP to user email for verification/reset' })
    async sendUserEmailOTP(@Body('email') email: string) {
        return this.authService.sendUserEmailOTP(email);
    }

    @Post('user/resend-otp')
    @ApiOperation({ summary: 'Resend verification OTP to user email' })
    async resendUserOTP(@Body('email') email: string) {
        return this.authService.sendEmailOTP(email);
    }

    @Post('user/forgot-password')
    @ApiOperation({ summary: 'User forgot password - send OTP' })
    async forgotUserPassword(@Body('email') email: string) {
        return this.authService.forgotUserPassword(email);
    }

    @Post('user/reset-password')
    @ApiOperation({ summary: 'Reset user password with email OTP' })
    async resetUserPassword(
        @Body('email') email: string,
        @Body('otp') otp: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.authService.resetUserPassword(email, otp, newPassword);
    }

    @Get('user/profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getUserProfile(@Query('userId') userId: string) {
        // In production, extract userId from JWT token
        return this.authService.getUserProfile(userId);
    }

    @Post('user/profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @UseGuards(AuthGuard('jwt'))
    async updateUserProfile(@Body() body: any, @Req() req: any) {
        return this.authService.updateUserProfile(req.user.id, body);
    }


}
