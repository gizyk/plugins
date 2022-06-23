import create from "zustand";
import { persist } from "zustand/middleware";
import produce from "immer";
import ShopifyClient, { Product, Collection } from "./ShopifyClient";

export type Status = "loading" | "success" | "error";

export type State = {
  query: string;
  searches: Record<string, { result: string[] | null; status: Status }>;
  collections: Record<string, { result: Collection | null; status: Status }>;
  collectionSearches: Record<
    string,
    { result: string[] | null; status: Status }
  >;
  products: Record<string, { result: Product | null; status: Status }>;
  getCollection(handle: string): {
    status: Status;
    collection: Collection | null;
  };
  getProduct(handle: string): {
    status: Status;
    product: Product | null;
  };
  getCurrentSearch(): {
    query: string;
    status: Status;
    products: Product[] | null;
  };
  getCurrentCollectionSearch(): {
    query: string;
    status: Status;
    collections: Collection[] | null;
  };
  fetchProductByHandle(client: ShopifyClient, handle: string): Promise<void>;
  fetchCollectionByHandle(client: ShopifyClient, handle: string): Promise<void>;
  fetchProductsMatching(client: ShopifyClient, query: string): Promise<void>;
  fetchCollectionsMatching(client: ShopifyClient, query: string): Promise<void>;
};

const useStore = create<State>(
  persist(
    (rawSet, get) => {
      const set = (setFn: (s: State) => void) => {
        return rawSet(produce(setFn));
      };

      return {
        query: "",
        products: {},
        collections: {},
        searches: {},
        collectionSearches: {},
        getProduct(handle: string) {
          const selectedProduct = get().products[handle];

          return {
            status:
              selectedProduct && selectedProduct.status
                ? selectedProduct.status
                : "loading",
            product: selectedProduct && selectedProduct.result,
          };
        },
        getCollection(handle: string) {
          const selectedCollection = get().collections[handle];

          return {
            status:
              selectedCollection && selectedCollection.status
                ? selectedCollection.status
                : "loading",
            collection: selectedCollection && selectedCollection.result,
          };
        },
        getCurrentSearch() {
          const state = get();

          const search = state.searches[state.query] || {
            status: "loading",
            result: [],
          };

          return {
            query: state.query,
            status: search.status,
            products:
              search.result &&
              search.result.map((id: string) => state.products[id].result!),
          };
        },
        getCurrentCollectionSearch() {
          const state = get();

          const search = state.collectionSearches[state.query] || {
            status: "loading",
            result: [],
          };

          return {
            query: state.query,
            status: search.status,
            collections:
              search.result &&
              search.result.map((id: string) => state.collections[id].result!),
          };
        },
        async fetchProductByHandle(client, handle) {
          set((state) => {
            state.products[handle] = state.products[handle] || { result: null };
            state.products[handle].status = "loading";
          });

          try {
            const product = await client.productByHandle(handle);

            set((state) => {
              state.products[handle].result = product;
              state.products[handle].status = "success";
            });
          } catch (e) {
            set((state) => {
              state.products[handle].result = null;
              state.products[handle].status = "error";
            });
          }
        },
        async fetchCollectionByHandle(client, handle) {
          set((state) => {
            state.collections[handle] = state.collections[handle] || {
              result: null,
            };
            state.collections[handle].status = "loading";
          });

          try {
            const collection = await client.collectionByHandle(handle);

            set((state) => {
              state.collections[handle].result = collection;
              state.collections[handle].status = "success";
            });
          } catch (e) {
            set((state) => {
              state.collections[handle].result = null;
              state.collections[handle].status = "error";
            });
          }
        },
        async fetchProductsMatching(client, query) {
          set((state) => {
            state.searches[query] = state.searches[query] || { result: [] };
            state.searches[query].status = "loading";
            state.query = query;
          });

          try {
            const products = await client.productsMatching(query);

            set((state) => {
              state.searches[query].status = "success";
              state.searches[query].result = products.map((p) => p.handle);

              products.forEach((product) => {
                state.products[product.handle] =
                  state.products[product.handle] || {};
                state.products[product.handle].result = product;
              });
            });
          } catch (e) {
            set((state) => {
              state.searches[query].status = "error";
              state.searches[query].result = null;
            });
          }
        },
        async fetchCollectionsMatching(client, query) {
          set((state) => {
            state.collectionSearches[query] = state.collectionSearches[
              query
            ] || { result: [] };
            state.collectionSearches[query].status = "loading";
            state.query = query;
          });

          try {
            const collections = await client.collectionMatching(query);

            set((state) => {
              state.collectionSearches[query].status = "success";
              state.collectionSearches[query].result = collections.map(
                (p) => p.handle
              );

              collections.forEach((collection) => {
                state.collections[collection.handle] =
                  state.collections[collection.handle] || {};
                state.collections[collection.handle].result = collection;
              });
            });
          } catch (e) {
            set((state) => {
              state.collectionSearches[query].status = "error";
              state.collectionSearches[query].result = null;
            });
          }
        },
      };
    },
    {
      name: "datocms-plugin-shopify-product",
    }
  )
);

export default useStore;
