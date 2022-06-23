import { Button, useCtx } from "datocms-react-ui";
import { Modal } from "datocms-plugin-sdk";
import s from "./styles.module.css";
import { Product, Collection, Item } from "../../utils/ShopifyClient";
import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

enum CollectionType {
  Products = "products",
  Collections = "collections",
}

const modals: { [key in CollectionType]: Modal } = {
  [CollectionType.Products]: {
    id: "browseProducts",
    title: "Browse Shopify products",
    width: "xl",
  },
  [CollectionType.Collections]: {
    id: "browseCollections",
    title: "Browse Shopify collections",
    width: "xl",
  },
};

export type EmptyProps = {
  onSelect: (item: Item) => void;
};

export default function Empty({ onSelect }: EmptyProps) {
  const ctx = useCtx<RenderFieldExtensionCtx>();

  const handleOpenModal = async (collectionType: CollectionType) => {
    const item = (await ctx.openModal(modals[collectionType])) as Item | null;

    if (item) {
      onSelect(item);
    }
  };

  return (
    <div className={s["empty"]}>
      <div className={s["empty__label"]}>No product selected!</div>
      <div className={s["empty__buttons"]}>
        <Button
          onClick={() => handleOpenModal(CollectionType.Products)}
          buttonSize="s"
          leftIcon={<FontAwesomeIcon icon={faSearch} />}
        >
          Browse Shopify products
        </Button>
        <Button
          onClick={() => handleOpenModal(CollectionType.Collections)}
          buttonSize="s"
          leftIcon={<FontAwesomeIcon icon={faSearch} />}
        >
          Browse Shopify collections
        </Button>
      </div>
    </div>
  );
}
