export const PRODUCT_FRAGMENT = `
id
title
handle
description
onlineStoreUrl
availableForSale
productType
priceRange {
  maxVariantPrice {
    amount
    currencyCode
  }
  minVariantPrice {
    amount
    currencyCode
  }
}
images(first: 1) {
  edges {
    node {
      src: transformedSrc(crop: CENTER, maxWidth: 200, maxHeight: 200)
    }
  }
}
`;
