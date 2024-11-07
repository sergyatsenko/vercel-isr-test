import {
  Field,
  GetStaticComponentProps,
  RichText as JssRichText,
  useSitecoreContext,
  useComponentProps,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Text: Field<string>;
}

export type RichTextProps = ComponentProps & {
  fields: Fields;
  params: { [key: string]: string };
};

export const Default = (props: RichTextProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext?.pageEditing;

  const componentProps = useComponentProps<RichTextProps>(props.rendering.uid) as RichTextProps;
  const editorId = componentProps.params?.RenderingIdentifier;

  return (
    <div className={`component rich-text ${componentProps.params.styles || ''}`} id={editorId}>
      <JssRichText field={componentProps?.fields.Text} editable={isEditing} />
      <br />
    </div>
  );
};

export const getStaticProps: GetStaticComponentProps = async (rendering) => {
  // You can fetch additional data here that your component might need
  // This runs at build time and during revalidation

  return {
    // Return any props your component needs
    fields: rendering.fields,
    params: rendering.params,
    // You can add additional props here if needed
    // For example, if you need to fetch related content:
    // relatedContent: await fetchRelatedContent(rendering.fields.someField.value)
  };
};

export const RichText = {
  Default,
  getStaticProps,
};

export default RichText;
