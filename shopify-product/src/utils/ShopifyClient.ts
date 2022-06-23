import { ValidConfig } from "../types";

import { PRODUCT_FRAGMENT } from "../components/Products/product.fragment";
import { COLLECTION_FRAGMENT } from "../components/Collections/collection.fragment";

export type Item = {
  handle: string;
  type: string;
};

export type Product = {
  handle: string;
  description: string;
  title: string;
  productType: string;
  onlineStoreUrl: string;
  imageUrl: string;
  priceRange: {
    maxVariantPrice: PriceTypes;
    minVariantPrice: PriceTypes;
  };
  images: {
    edges: [
      {
        node: {
          src: string;
        };
      }
    ];
  };
};

export type Collection = {
  handle: string;
  description: string;
  id: string;
  title: string;
  products: Product[];
};

export type PriceTypes = {
  amount: number;
  currencyCode: string;
};

export type Products = {
  edges: [{ node: Product }];
};

const normalizeProduct = (product: any): Product => {
  if (!product || typeof product !== "object") {
    throw new Error("Invalid product");
  }

  return {
    ...product,
    imageUrl: product.images.edges[0]?.node.src || "",
  };
};

const normalizeCollection = (collection: any): Collection => {
  if (!collection || typeof collection !== "object") {
    throw new Error("Invalid collection");
  }

  return {
    ...collection,
    products: normalizeProducts(collection.products),
  };
};

const normalizeProducts = (products: any): Product[] =>
  products.edges.map((edge: any) => normalizeProduct(edge.node));

const normalizeCollections = (collections: any): Collection[] =>
  collections.edges.map((edge: any) => normalizeCollection(edge.node));

export default class ShopifyClient {
  storefrontAccessToken: string;
  shopifyDomain: string;

  constructor({
    storefrontAccessToken,
    shopifyDomain,
  }: Pick<ValidConfig, "shopifyDomain" | "storefrontAccessToken">) {
    this.storefrontAccessToken = storefrontAccessToken;
    this.shopifyDomain = shopifyDomain;
  }

  async productsMatching(query: string) {
    const response = await this.fetch({
      query: `
        query getProducts($query: String) {
          shop {
            products(first: 10, query: $query) {
              edges {
                node {
                  ${PRODUCT_FRAGMENT}
                }
              }
            }
          }
        }
      `,
      variables: { query: query || null },
    });

    return normalizeProducts(response.shop.products);
  }

  async collectionMatching(query: string) {
    const response = await this.fetch({
      query: `
        query getCollection($query: String) {
          collections(first: 10, query: $query) {
            edges {
              node {
                ${COLLECTION_FRAGMENT}
              }
            }
          }
        }
      `,
      variables: { query: query || null },
    });

    return normalizeCollections(response.collections);
  }

  async productByHandle(handle: string) {
    const response = await this.fetch({
      query: `
        query getProduct($handle: String!) {
          shop {
            product: productByHandle(handle: $handle) {
              ${PRODUCT_FRAGMENT}
            }
          }
        }
      `,
      variables: { handle },
    });

    return normalizeProduct(response.shop.product);
  }

  async collectionByHandle(handle: string) {
    const response = await this.fetch({
      query: `
        query getCollection($handle: String!) {
          collection: collectionByHandle(handle: $handle) {
            ${COLLECTION_FRAGMENT}
          }
        }
      `,
      variables: { handle },
    });

    return normalizeCollection(response.collection);
  }

  async fetch(requestBody: any) {
    const res = await fetch(
      `https://${this.shopifyDomain}.myshopify.com/api/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": this.storefrontAccessToken,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (res.status !== 200) {
      throw new Error(`Invalid status code: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const body = await res.json();

    return body.data;
  }
}
