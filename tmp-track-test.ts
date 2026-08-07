import { orderService } from "./src/module/order/order.service";

const ORDER_UUID = "532b105e-c83f-40c4-987b-aaf3055ec21e";

async function main() {
  const flow = [
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
  ] as const;

  let current = await orderService.getById(ORDER_UUID);
  console.log("start:", current.status);

  for (const status of flow) {
    // eslint-disable-next-line no-await-in-loop
    current = await orderService.updateStatus(ORDER_UUID, { status });
    console.log("->", current.status);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
