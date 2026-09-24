import type { StructureResolver } from 'sanity/structure'

// "Merch Product" covers every non-honey shop item (candles, hampers,
// soap, lip balm, experiences) as one Sanity document type — Studio's
// default nav lists them all in one flat pile, which only gets messier as
// the range grows. This splits that single list into one filtered view
// per shop category instead, matching the categories customers actually
// see on /shop. Keep this list in sync with the `category` field's
// options in merchProduct.ts.
const MERCH_CATEGORIES: { title: string; value: string }[] = [
  { title: 'Candles', value: 'candles' },
  { title: 'Gift Hampers', value: 'hamper' },
  { title: 'Soap', value: 'soap' },
  { title: 'Lip Balm', value: 'lip-balm' },
  { title: 'Experiences', value: 'experiences' },
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Merch Product')
        .child(
          S.list()
            .title('Merch Product')
            .items(
              MERCH_CATEGORIES.map(({ title, value }) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentTypeList('merchProduct')
                      .title(title)
                      .filter('_type == "merchProduct" && category == $category')
                      .params({ category: value })
                  )
              )
            )
        ),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'merchProduct'),
    ])
