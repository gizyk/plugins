import { RenderModalCtx } from "datocms-plugin-sdk";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, TextInput, Canvas, Spinner } from "datocms-react-ui";
import s from "./styles.module.css";
import ShopifyClient, { Collection } from "../../../utils/ShopifyClient";
import useStore, { State } from "../../../utils/useStore";
import { normalizeConfig } from "../../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

const currentSearchSelector = (state: State) =>
  state.getCurrentCollectionSearch();
const currentFetchCollectionsMatchingSelector = (state: State) =>
  state.fetchCollectionsMatching;

export default function BrowseCollectionsModal({
  ctx,
}: {
  ctx: RenderModalCtx;
}) {
  const performSearchCollections = useStore(
    currentFetchCollectionsMatchingSelector
  );
  const { query, status, collections } = useStore(currentSearchSelector);

  const [sku, setSku] = useState<string>("");

  const { storefrontAccessToken, shopifyDomain } = normalizeConfig(
    ctx.plugin.attributes.parameters
  );

  const client = useMemo(() => {
    return new ShopifyClient({ shopifyDomain, storefrontAccessToken });
  }, [storefrontAccessToken, shopifyDomain]);

  useEffect(() => {
    performSearchCollections(client, query);
  }, [performSearchCollections, query, client]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearchCollections(client, sku);
  };

  const handleItemSelect = (collection: Collection) => {
    ctx.resolve({
      handle: collection.handle,
      type: "Collection",
    });
  };

  return (
    <Canvas ctx={ctx}>
      <div className={s["browse"]}>
        <form className={s["search"]} onSubmit={handleSubmit}>
          <TextInput
            placeholder="Search products... (ie. mens shirts)"
            id="sku"
            name="sku"
            value={sku}
            onChange={setSku}
            className={s["search__input"]}
          />

          <Button
            type="submit"
            buttonType="primary"
            buttonSize="s"
            leftIcon={<FontAwesomeIcon icon={faSearch} />}
            disabled={status === "loading"}
          >
            Search
          </Button>
        </form>
        <div className={s["container"]}>
          {collections && collections.filter((x: any) => !!x) && (
            <div
              className={classNames(s["products"], {
                [s["products__loading"]]: status === "loading",
              })}
            >
              {collections.map((product: Collection) => (
                <div
                  key={product.handle}
                  onClick={() => handleItemSelect(product)}
                  className={s["product"]}
                >
                  <div className={s["product__content"]}>
                    <div className={s["product__title"]}>{product.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {status === "loading" && <Spinner size={25} placement="centered" />}
          {status === "success" && collections && collections.length === 0 && (
            <div className={s["empty"]}>No collections found!</div>
          )}
          {status === "error" && (
            <div className={s["empty"]}>API call failed!</div>
          )}
        </div>
      </div>
    </Canvas>
  );
}
