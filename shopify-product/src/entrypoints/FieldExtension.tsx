import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import ProductsValue from "../components/Products/Value";
import CollectionsValue from "../components/Collections/Value";
import Empty from "../components/Empty";
import { Item } from "../utils/ShopifyClient";
import get from "lodash-es/get";

type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

export default function FieldExtension({ ctx }: PropTypes) {
  const value = get(ctx.formValues, ctx.fieldPath) as string;
  const parsedValue = JSON.parse(value) as Item | null;

  const handleSelect = (item: Item) => {
    ctx.setFieldValue(ctx.fieldPath, JSON.stringify(item));
  };

  const handleReset = () => {
    ctx.setFieldValue(ctx.fieldPath, {});
  };

  return (
    <Canvas ctx={ctx}>
      {parsedValue && parsedValue.handle ? (
        <>
          {parsedValue.type === "Product" && (
            <ProductsValue value={parsedValue} onReset={handleReset} />
          )}
          {parsedValue.type === "Collection" && (
            <CollectionsValue value={parsedValue} onReset={handleReset} />
          )}
        </>
      ) : (
        <Empty onSelect={handleSelect} />
      )}
    </Canvas>
  );
}
