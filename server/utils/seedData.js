const bcrypt = require("bcryptjs");

const Address = require("../models/Address");
const Order = require("../models/Order");
const Editorial = require("../models/Editorial");
const Product = require("../models/Product");
const User = require("../models/User");
const HomeContent = require("../models/HomeContent");
const seedEditorials = require("../data/seedEditorials");
const seedHomeContent = require("../data/seedHomeContent");
const seedProducts = require("../data/seedProducts");

const sampleCustomerConfigs = [
  {
    email: "minsu.kim@moonatelier.com",
    name: "김민수",
    password: "Customer123!",
    contact: "01098765432",
    addresses: [{ label: "집", address: "서울시 성동구 아차산로 100", order: 1, isDefault: true }],
  },
  {
    email: "yeonghui.lee@moonatelier.com",
    name: "이영희",
    password: "Customer123!",
    contact: "01087654321",
    addresses: [{ label: "회사", address: "서울시 강남구 테헤란로 212", order: 1, isDefault: true }],
  },
  {
    email: "jiwon.park@moonatelier.com",
    name: "박지원",
    password: "Customer123!",
    contact: "01076543210",
    addresses: [{ label: "집", address: "경기도 성남시 분당구 판교역로 235", order: 1, isDefault: true }],
  },
];

const ensureSeedProducts = async () => {
  const productCount = await Product.countDocuments();

  if (productCount > 0) {
    return;
  }

  await Product.insertMany(seedProducts);
  console.log("기본 상품 데이터를 시드했습니다.");
};

/** 기존 스키마(id + 문자열 sku) 문서를 숫자 sku 단일 필드로 이전합니다. */
const migrateLegacyProductIdentifiers = async () => {
  const legacyProducts = await Product.find({ id: { $exists: true } }).select("_id id").lean();

  for (const product of legacyProducts) {
    const skuVal = Number(product.id);
    if (!Number.isInteger(skuVal) || skuVal < 1) {
      continue;
    }
    await Product.updateOne(
      { _id: product._id },
      { $set: { sku: skuVal }, $unset: { id: 1 } }
    );
  }
};

const ensureProductCategory2 = async () => {
  await Product.updateMany(
    { $or: [{ category2: { $exists: false } }, { category2: null }, { category2: "" }] },
    { $set: { category2: "Women" } }
  );
};

const ensureProductMainSelectionOrder = async () => {
  const orderedProducts = await Product.find().sort({ sku: 1 }).select("_id sku mainSelectionOrder").lean();
  const defaultSelectionSkus = new Set([1, 2, 3, 4]);

  for (const product of orderedProducts) {
    if (product.mainSelectionOrder !== undefined) {
      continue;
    }

    const nextValue = defaultSelectionSkus.has(product.sku) ? product.sku : null;
    await Product.updateOne({ _id: product._id }, { $set: { mainSelectionOrder: nextValue } });
  }
};

const ensureHomeContent = async () => {
  const exists = await HomeContent.exists({ documentKey: "home" });

  if (exists) {
    return;
  }

  await HomeContent.create(seedHomeContent);
  console.log("메인 페이지 콘텐츠 기본값을 시드했습니다.");
};

const ensureSeedEditorials = async () => {
  const editorialCount = await Editorial.countDocuments();

  if (editorialCount > 0) {
    return;
  }

  await Editorial.insertMany(seedEditorials);
  console.log("기본 에디토리얼 데이터를 시드했습니다.");
};

/** 기존 DB 문서에 homeOrder가 없을 때 기본 슬러그 순서로 채움 (과거 하드코딩 순서와 동일) */
const LEGACY_EDITORIAL_HOME_ORDER = ["behind-the-story", "spring-lookbook", "minimalism-of-light"];

const ensureEditorialHomeOrder = async () => {
  const needsBackfill = await Editorial.exists({
    $or: [{ homeOrder: { $exists: false } }, { homeOrder: null }],
  });

  if (!needsBackfill) {
    return;
  }

  for (let i = 0; i < LEGACY_EDITORIAL_HOME_ORDER.length; i++) {
    await Editorial.updateOne({ slug: LEGACY_EDITORIAL_HOME_ORDER[i] }, { $set: { homeOrder: i } });
  }

  const remaining = await Editorial.find({ slug: { $nin: LEGACY_EDITORIAL_HOME_ORDER } })
    .sort({ createdAt: 1 })
    .select("_id")
    .lean();

  let next = LEGACY_EDITORIAL_HOME_ORDER.length;
  for (const doc of remaining) {
    await Editorial.updateOne({ _id: doc._id }, { $set: { homeOrder: next } });
    next += 1;
  }

  console.log("에디토리얼 homeOrder 필드를 보정했습니다.");
};

const ensureEditorialClosingCta = async () => {
  const starterSlugs = ["minimalism-of-light", "spring-lookbook", "behind-the-story"];

  await Editorial.updateMany(
    { slug: { $in: starterSlugs } },
    {
      $set: {
        closingCtaLabel: "스토어 메인으로 돌아가기",
        closingCtaHref: "/",
      },
    }
  );
};

/** 비하인드 스토리 에디토리얼은 Related Products 블록을 쓰지 않음 */
const ensureBehindStoryNoRelatedProductSkus = async () => {
  await Editorial.updateOne({ slug: "behind-the-story" }, { $set: { relatedProductSkus: [] } });
};

const ensureAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@moonatelier.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminName = process.env.ADMIN_NAME || "Moon Admin";

  const existingAdmin = await User.findOne({ email: adminEmail }).lean();

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    email: adminEmail,
    name: adminName,
    password: hashedPassword,
    contact: "01012345678",
    requiredTermsAgreed: 1,
    optionalTermsAgreed: 1,
    userType: "admin",
  });

  console.log(`기본 관리자 계정을 생성했습니다: ${adminEmail}`);
};

const ensureSampleCustomers = async () => {
  const emails = sampleCustomerConfigs.map((customer) => customer.email);
  const existingUsers = await User.find({ email: { $in: emails } }).select("_id email").lean();
  const existingEmails = new Set(existingUsers.map((user) => user.email));

  for (const customer of sampleCustomerConfigs) {
    if (existingEmails.has(customer.email)) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(customer.password, 10);
    const createdUser = await User.create({
      email: customer.email,
      name: customer.name,
      password: hashedPassword,
      contact: customer.contact,
      requiredTermsAgreed: 1,
      optionalTermsAgreed: 1,
      userType: "customer",
    });

    await Address.insertMany(
      customer.addresses.map((address) => ({
        ...address,
        userId: createdUser._id,
      }))
    );
  }

  const users = await User.find({ email: { $in: emails } }).lean();

  for (const user of users) {
    const hasAddress = await Address.exists({ userId: user._id });
    if (hasAddress) {
      continue;
    }

    const fallbackConfig = sampleCustomerConfigs.find((customer) => customer.email === user.email);
    if (!fallbackConfig) {
      continue;
    }

    await Address.insertMany(
      fallbackConfig.addresses.map((address) => ({
        ...address,
        userId: user._id,
      }))
    );
  }

  return users;
};

const ensureDefaultAddresses = async () => {
  const userIds = await Address.distinct("userId");

  for (const userId of userIds) {
    const defaultAddress = await Address.findOne({ userId, isDefault: true }).select("_id").lean();
    if (defaultAddress) {
      continue;
    }

    const firstAddress = await Address.findOne({ userId }).sort({ order: 1, createdAt: 1 }).select("_id").lean();
    if (firstAddress) {
      await Address.findByIdAndUpdate(firstAddress._id, { isDefault: true });
    }
  }
};

const buildOrderItem = (product, overrides = {}) => ({
  productId: product.sku,
  productName: product.name,
  productCategory: product.category,
  productImage: product.image,
  unitPrice: Number(product.price),
  quantity: overrides.quantity || 1,
  selectedColor: overrides.selectedColor || product.colors?.[0]?.name || "기본",
  selectedSize: overrides.selectedSize || product.sizes?.[0] || "Free",
});

const calculateOrderTotal = (items) =>
  Number(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2));

const ensureSampleOrders = async (customers) => {
  const orderCount = await Order.countDocuments();

  if (orderCount > 0) {
    return;
  }

  const products = await Product.find().sort({ sku: 1 }).lean();

  if (products.length < 4 || customers.length === 0) {
    return;
  }

  const customerByEmail = customers.reduce((result, customer) => {
    result[customer.email] = customer;
    return result;
  }, {});

  const productBySku = products.reduce((result, product) => {
    result[product.sku] = product;
    return result;
  }, {});

  const sampleOrders = [
    {
      orderId: "ORD-001234",
      customerEmail: "minsu.kim@moonatelier.com",
      status: "processing",
      createdAt: new Date("2024-12-30T09:00:00.000Z"),
      items: [
        buildOrderItem(productBySku[1], { quantity: 1, selectedColor: "Camel", selectedSize: "M" }),
      ],
      paymentMethod: "Credit Card",
      trackingNumber: "",
    },
    {
      orderId: "ORD-001233",
      customerEmail: "yeonghui.lee@moonatelier.com",
      status: "shipped",
      createdAt: new Date("2024-12-29T13:20:00.000Z"),
      items: [
        buildOrderItem(productBySku[3], { quantity: 1, selectedColor: "White", selectedSize: "S" }),
        buildOrderItem(productBySku[8], { quantity: 1, selectedColor: "Tan", selectedSize: "M" }),
      ],
      paymentMethod: "Credit Card",
      trackingNumber: "MOON-TRACK-233",
    },
    {
      orderId: "ORD-001232",
      customerEmail: "jiwon.park@moonatelier.com",
      status: "delivered",
      createdAt: new Date("2024-12-27T07:45:00.000Z"),
      items: [
        buildOrderItem(productBySku[4], { quantity: 1, selectedColor: "Black", selectedSize: "One Size" }),
      ],
      paymentMethod: "PayPal",
      trackingNumber: "MOON-TRACK-232",
    },
    {
      orderId: "ORD-001231",
      customerEmail: "minsu.kim@moonatelier.com",
      status: "confirmed",
      createdAt: new Date("2024-12-24T10:10:00.000Z"),
      items: [
        buildOrderItem(productBySku[5], { quantity: 1, selectedColor: "Cream", selectedSize: "L" }),
        buildOrderItem(productBySku[2], { quantity: 1, selectedColor: "Black", selectedSize: "M" }),
      ],
      paymentMethod: "Credit Card",
      trackingNumber: "",
    },
  ];

  await Order.insertMany(
    sampleOrders
      .map((order) => {
        const customer = customerByEmail[order.customerEmail];

        if (!customer) {
          return null;
        }

        const customerConfig = sampleCustomerConfigs.find(
          (sampleCustomer) => sampleCustomer.email === order.customerEmail
        );
        const primaryAddress = customerConfig?.addresses?.[0];

        return {
          orderId: order.orderId,
          userId: customer._id,
          userKey: String(customer._id),
          items: order.items,
          totalPrice: calculateOrderTotal(order.items),
          status: order.status,
          paymentMethod: order.paymentMethod,
          shippingAddress: {
            name: customer.name,
            email: customer.email,
            phone: customer.contact,
            addressLabel: primaryAddress?.label || "기본 배송지",
            address: primaryAddress?.address || "서울시 강남구 테헤란로 1",
            deliveryNote: "문 앞에 놓아주세요.",
          },
          trackingNumber: order.trackingNumber,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
        };
      })
      .filter(Boolean)
  );

  console.log("샘플 주문 데이터를 시드했습니다.");
};

const ensureSeedData = async () => {
  await ensureHomeContent();
  await ensureSeedProducts();
  await migrateLegacyProductIdentifiers();
  await ensureProductCategory2();
  await ensureProductMainSelectionOrder();
  await ensureSeedEditorials();
  await ensureEditorialHomeOrder();
  await ensureEditorialClosingCta();
  await ensureBehindStoryNoRelatedProductSkus();
  await ensureAdminUser();
  const customers = await ensureSampleCustomers();
  await ensureDefaultAddresses();
  await ensureSampleOrders(customers);
};

module.exports = {
  ensureSeedData,
};
