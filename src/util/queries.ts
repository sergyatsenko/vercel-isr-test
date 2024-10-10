export const GET_PAGE_DATA = `
  query($path: String!) {
  item(path: $path, language: "en") {
    Title: field(name: "title") {
        value
    }
    Content: field(name: "content") {
        value
    }
    Heading: field(name: "heading") {
        value
    }
  }
}
`;
