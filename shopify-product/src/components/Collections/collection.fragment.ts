import { PRODUCT_FRAGMENT } from "../Products/product.fragment";

export const COLLECTION_FRAGMENT = `
id
description
handle
title
products(first: 10) {
  edges {
    node {
      ${PRODUCT_FRAGMENT}
    }
  }
}
`;
