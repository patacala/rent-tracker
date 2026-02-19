import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OnboardingService } from '../../application/onboarding/onboarding.service';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';

@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post()
  async save(@Request() req: any, @Body() dto: SaveOnboardingDto) {
    return this.onboardingService.save(req.user.id, dto);
  }

  @Get()
  async get(@Request() req: any) {
    return this.onboardingService.findByUserId(req.user.id);
  }
}