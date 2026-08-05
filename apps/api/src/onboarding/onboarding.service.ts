import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OnboardingService {
  private readonly steps = [
    'profile',
    'invite_team',
    'first_procurement',
    'connect_vendors',
    'explore_ai',
  ] as const;

  constructor(private readonly prisma: PrismaService) {}

  async getStatus(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return {
      currentStep: organisation.onboardingStep,
      totalSteps: this.steps.length,
      steps: this.steps.map((id, index) => ({
        id,
        completed: index < organisation.onboardingStep,
        current: index === organisation.onboardingStep,
      })),
      completed: Boolean(organisation.onboardingCompletedAt),
      completedAt: organisation.onboardingCompletedAt,
    };
  }

  async advance(organisationId: string) {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    const nextStep = Math.min(
      organisation.onboardingStep + 1,
      this.steps.length,
    );
    const completed = nextStep >= this.steps.length;

    return this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        onboardingStep: nextStep,
        onboardingCompletedAt: completed ? new Date() : null,
      },
    });
  }

  async skip(organisationId: string) {
    return this.prisma.organisation.update({
      where: { id: organisationId },
      data: {
        onboardingStep: this.steps.length,
        onboardingCompletedAt: new Date(),
      },
    });
  }
}
