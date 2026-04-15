const Product = require("../models/Product");
const categoryOptions = ["Outerwear", "Tops", "Bottoms", "Dresses", "Knitwear", "Accessories"];
const category2Options = ["Men", "Women", "Accessories"];

const productFields = [
  "name",
  "price",
  "description",
  "details",
  "image",
  "hoverImage",
  "images",
  "colors",
  "sizes",
  "isNew",
  "category",
  "category2",
  "mainSelectionOrder",
];

const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }

    return result;
  }, {});

const normalizeProductPayload = (payload) => {
  const details = Array.isArray(payload.details)
    ? payload.details.map((detail) => String(detail).trim()).filter(Boolean)
    : [];
  const images = Array.isArray(payload.images)
    ? payload.images.map((image) => String(image).trim()).filter(Boolean)
    : [];
  const colors = Array.isArray(payload.colors)
    ? payload.colors
        .map((color) => ({
          name: String(color?.name || "").trim(),
          hex: String(color?.hex || "").trim(),
        }))
        .filter((color) => color.name && color.hex)
    : [];
  const sizes = Array.isArray(payload.sizes)
    ? payload.sizes.map((size) => String(size).trim()).filter(Boolean)
    : [];

  const primaryImage = String(payload.image || images[0] || "").trim();
  const hoverImage = String(payload.hoverImage || images[1] || primaryImage).trim();

  const parsedMainSelectionOrder =
    payload.mainSelectionOrder === null ||
    payload.mainSelectionOrder === undefined ||
    String(payload.mainSelectionOrder).trim() === ""
      ? null
      : Number.parseInt(payload.mainSelectionOrder, 10);

  return {
    ...payload,
    name: String(payload.name || "").trim(),
    price: String(payload.price || "").trim(),
    description: String(payload.description || "").trim(),
    category: String(payload.category || "").trim(),
    category2: String(payload.category2 || "").trim(),
    details,
    image: primaryImage,
    hoverImage,
    images: images.length > 0 ? images : [primaryImage].filter(Boolean),
    colors,
    sizes,
    isNew: Boolean(payload.isNew),
    mainSelectionOrder:
      Number.isInteger(parsedMainSelectionOrder) && parsedMainSelectionOrder > 0
        ? parsedMainSelectionOrder
        : null,
  };
};

const validateProductPayload = (payload) => {
  if (!payload.name) {
    return "상품명을 입력해주세요.";
  }

  if (!payload.price || Number.isNaN(Number(payload.price))) {
    return "올바른 가격을 입력해주세요.";
  }

  if (!payload.category) {
    return "카테고리를 선택해주세요.";
  }

  if (!categoryOptions.includes(payload.category)) {
    return "허용되지 않은 카테고리입니다.";
  }

  if (!payload.category2) {
    return "카테고리2(맨/우먼/액세서리)를 선택해주세요.";
  }

  if (!category2Options.includes(payload.category2)) {
    return "허용되지 않은 카테고리2입니다.";
  }

  if (!payload.image) {
    return "대표 이미지 URL을 입력해주세요.";
  }

  if (!payload.hoverImage) {
    return "보조 이미지 URL을 입력해주세요.";
  }

  if (payload.colors.length === 0) {
    return "색상 정보를 한 개 이상 입력해주세요.";
  }

  if (payload.sizes.length === 0) {
    return "사이즈를 한 개 이상 선택해주세요.";
  }

  if (payload.mainSelectionOrder !== null && !Number.isInteger(payload.mainSelectionOrder)) {
    return "메인 셀렉션 순서는 1 이상의 정수만 입력할 수 있습니다.";
  }

  return "";
};

const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 50;

const parsePositiveInteger = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getSearchTerms = (value) =>
  String(value || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
const getSearchTermVariants = (term) => {
  const normalizedTerm = String(term || "").trim().toLowerCase();
  const variants = new Set([normalizedTerm]);

  if (["man", "men", "male", "남자"].includes(normalizedTerm)) {
    variants.add("men");
    variants.add("man");
    variants.add("male");
    variants.add("남자");
  }

  if (["woman", "women", "female", "여자"].includes(normalizedTerm)) {
    variants.add("women");
    variants.add("woman");
    variants.add("female");
    variants.add("여자");
  }

  return [...variants].map(escapeRegex);
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ sku: 1 }).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "상품 목록 조회에 실패했습니다.", error: error.message });
  }
};

const getPaginatedProducts = async (req, res) => {
  try {
    const requestedPage = parsePositiveInteger(req.query.page, 1);
    const requestedLimit = parsePositiveInteger(req.query.limit, DEFAULT_PAGE_SIZE);
    const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
    const searchTerms = getSearchTerms(req.query.q);
    const category = String(req.query.category || "").trim();

    const filters = {};

    if (searchTerms.length > 0) {
      filters.$and = searchTerms.map((term) => {
        const keywordRegex = new RegExp(getSearchTermVariants(term).join("|"), "i");

        return {
          $or: [
            { name: keywordRegex },
            { description: keywordRegex },
            { category: keywordRegex },
            { category2: keywordRegex },
          ],
        };
      });
    }

    if (category && category.toLowerCase() !== "all") {
      filters.category = category;
    }

    const total = await Product.countDocuments(filters);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
    const skip = (page - 1) * limit;
    const items = await Product.find(filters).sort({ createdAt: -1, sku: -1 }).skip(skip).limit(limit).lean();


    res.json({
      items,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: "상품 페이지 조회에 실패했습니다.", error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
    }

    const product = await Product.findOne({ sku: productId }).lean();

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "상품 조회에 실패했습니다.", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const pickedPayload = pickFields(req.body, productFields);
    const payload = normalizeProductPayload(pickedPayload);
    const validationMessage = validateProductPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const lastProduct = await Product.findOne().sort({ sku: -1 }).lean();
    const nextSku = (lastProduct?.sku || 0) + 1;

    const createdProduct = await Product.create({
      ...payload,
      sku: nextSku,
    });

    return res.status(201).json(createdProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "이미 사용 중인 SKU입니다." });
    }
    return res.status(400).json({ message: "상품 생성에 실패했습니다.", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
    }

    const pickedPayload = pickFields(req.body, productFields);
    const payload = normalizeProductPayload(pickedPayload);
    const validationMessage = validateProductPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const updatedProduct = await Product.findOneAndUpdate({ sku: productId }, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedProduct) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(400).json({ message: "상품 수정에 실패했습니다.", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
    }

    const deletedProduct = await Product.findOneAndDelete({ sku: productId }).lean();

    if (!deletedProduct) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    return res.json({ message: "상품을 삭제했습니다.", product: deletedProduct });
  } catch (error) {
    return res.status(500).json({ message: "상품 삭제에 실패했습니다.", error: error.message });
  }
};

module.exports = {
  getProducts,
  getPaginatedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
