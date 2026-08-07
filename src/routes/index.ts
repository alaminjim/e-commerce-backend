import { Router } from "express";

import { authRouter } from "../module/auth/auth.route";
import { userRouter } from "../module/user/user.route";
import { addressRouter } from "../module/address/address.route";
import { healthRouter } from "../module/health/health.route";
import { productRouter } from "../module/product/product.route";
import { wishlistRouter } from "../module/wishlist/wishlist.route";
import { cartRouter } from "../module/cart/cart.route";
import { categoryRouter } from "../module/category/category.route";
import { collectionRouter } from "../module/collection/collection.route";
import { brandRouter } from "../module/brand/brand.route";
import { orderRouter } from "../module/order/order.route";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/users", userRouter);
routes.use("/addresses", addressRouter);
routes.use("/health", healthRouter);
routes.use("/products", productRouter);
routes.use("/wishlist", wishlistRouter);
routes.use("/cart", cartRouter);
routes.use("/categories", categoryRouter);
routes.use("/collections", collectionRouter);
routes.use("/brands", brandRouter);
routes.use("/orders", orderRouter);

export { routes };
