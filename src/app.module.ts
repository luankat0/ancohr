import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ResumeParserModule } from './modules/resume-parser/resume-parser.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CommonModule } from './common/common.module';
import { QueuesModule } from './queues/queues.module';

@Module({
    imports: [
        AuthModule,
        CompaniesModule,
        JobsModule,
        CandidatesModule,
        ApplicationsModule,
        ResumeParserModule,
        ScoringModule,
        IntegrationsModule,
        NotificationsModule,
        AnalyticsModule,
        CommonModule,
        QueuesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
