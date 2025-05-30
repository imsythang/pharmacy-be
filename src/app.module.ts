//app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { PrismaModule } from './prisma/prisma.module';
import { CartModule } from './modules/cart/cart.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SharedModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    ArticlesModule,
    CartModule,
    ContactModule,
    // Add other modules here as needed
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
