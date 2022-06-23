import { useCallback, useEffect, useMemo } from "react";
import { normalizeConfig } from "../../../types";
import Price from "../../Price";
import { useCtx } from "datocms-react-ui";
import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import ShopifyClient, { Item } from "../../../utils/ShopifyClient";
import useStore, { State } from "../../../utils/useStore";
import s from "./styles.module.css";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const fetchCollectionByHandleSelector = (state: State) =>
  state.fetchCollectionByHandle;

export type ValueProps = {
  value: Item;
  onReset: () => void;
};

export default function Value({ value, onReset }: ValueProps) {
  const ctx = useCtx<RenderFieldExtensionCtx>();

  const { storefrontAccessToken, shopifyDomain } = normalizeConfig(
    ctx.plugin.attributes.parameters
  );

  const client = useMemo(
    () => new ShopifyClient({ shopifyDomain, storefrontAccessToken }),
    [storefrontAccessToken, shopifyDomain]
  );

  const { collection, status } = useStore(
    useCallback((state) => state.getCollection(value.handle), [value])
  );

  const fetchCollectionByHandle = useStore(fetchCollectionByHandleSelector);

  useEffect(() => {
    fetchCollectionByHandle(client, value.handle);
  }, [client, value, fetchCollectionByHandle]);

  return (
    <div
      className={classNames(s["value"], {
        [s["loading"]]: status === "loading",
      })}
    >
      {status === "error" && (
        <div className={s["product"]}>
          API Error! Could not fetch details for product:&nbsp;
          <code>{value.handle}</code>
        </div>
      )}
      {collection?.products?.map((product) => (
        <div className={s["product"]}>
          <div
            className={s["product__image"]}
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
          <div className={s["product__info"]}>
            <div className={s["product__title"]}>
              <a
                href={product.onlineStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.title}
              </a>
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </div>
            <div className={s["product__description"]}>
              {product.description}
            </div>
            {product.productType && (
              <div className={s["product__producttype"]}>
                <strong>Product type:</strong>
                &nbsp;
                {product.productType}
              </div>
            )}

            <div className={s["product__price"]}>
              <strong>Price:</strong>
              &nbsp;
              {product.priceRange.maxVariantPrice.amount !==
              product.priceRange.minVariantPrice.amount ? (
                <span>
                  <Price {...product.priceRange.minVariantPrice} />
                  &nbsp; - &nbsp;
                  <Price {...product.priceRange.maxVariantPrice} />
                </span>
              ) : (
                <Price {...product.priceRange.maxVariantPrice} />
              )}
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={onReset} className={s["reset"]}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </button>
    </div>
  );
}
