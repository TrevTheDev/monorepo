import { it } from 'vitest'
import { v } from '../../src'

interface Category {
  name: string
  subcategories: Category[]
}

const testCategory: Category = {
  name: 'I',
  subcategories: [
    {
      name: 'A',
      subcategories: [
        {
          name: '1',
          subcategories: [
            {
              name: 'a',
              subcategories: [],
            },
          ],
        },
      ],
    },
  ],
}

it.skip('recursion with v.late.object', () => {
  // const Category: v.ZodType<Category> = v.late.object(() => ({
  //   name: v.string,
  //   subcategories: v.array(Category),
  // }))
  // Category.parse(testCategory)
})

it('recursion with v.lazy', () => {
  const category = v.lazy(() =>
    v.object({
      name: v.string,
      subcategories: v.array(category),
    }),
  )
  category.parse(testCategory)
})

it.skip('schema getter', () => {
  // v.lazy(() => v.string).schema.parse('asdf')
})

type LinkedList = null | { value: number; next: LinkedList }

const linkedListExample = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: null,
      },
    },
  },
}

it('recursion involving union type', () => {
  const LinkedListSchema: v.Lazy<LinkedList> = v.lazy<LinkedList>(() =>
    v.union([
      v.null,
      v.object({
        value: v.number,
        next: LinkedListSchema,
      }),
    ]),
  )
  // type X = v.Infer<typeof LinkedListSchema>
  LinkedListSchema.parse(linkedListExample)
})

// interface A {
//   val: number;
//   b: B;
// }

// interface B {
//   val: number;
//   a: A;
// }

// const A: v.ZodType<A> = v.late.object(() => ({
//   val: v.number(),
//   b: B,
// }));

// const B: v.ZodType<B> = v.late.object(() => ({
//   val: v.number(),
//   a: A,
// }));

// const Alazy: v.ZodType<A> = v.lazy(() => v.object({
//   val: v.number(),
//   b: B,
// }));

// const Blazy: v.ZodType<B> = v.lazy(() => v.object({
//   val: v.number(),
//   a: A,
// }));

// const a: any = { val: 1 };
// const b: any = { val: 2 };
// a.b = b;
// b.a = a;

// it('valid check', () => {
//   A.parse(a);
//   B.parse(b);
// });

// it("valid check lazy", () => {
//   A.parse({val:1, b:});
//   B.parse(b);
// });

// it('masking check', () => {
//   const FragmentOnA = z
//     .object({
//       val: v.number(),
//       b: z
//         .object({
//           val: v.number(),
//           a: z
//             .object({
//               val: v.number(),
//             })
//             .nonstrict(),
//         })
//         .nonstrict(),
//     })
//     .nonstrict();

//   const fragment = FragmentOnA.parse(a);
//   fragment;
// });

// it('invalid check', () => {
//   expect(() => A.parse({} as any)).toThrow();
// });

// it('schema getter', () => {
//   (A as v.ZodLazy<any>).schema;
// });

// it("self recursion with cyclical data", () => {
//   interface Category {
//     name: string;
//     subcategories: Category[];
//   }

//   const Category: v.ZodType<Category> = v.late.object(() => ({
//     name: v.string,
//     subcategories: v.array(Category),
//   }));

//   const untypedCategory: any = {
//     name: "Category A",
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory);
// });

// it("self recursion with base type", () => {
//   const BaseCategory = v.object({
//     name: v.string,
//   });
//   type BaseCategory = v.infer<typeof BaseCategory>;

//   type Category = BaseCategory & { subcategories: Category[] };

//   const Category: v.ZodType<Category> = v.late
//     .object(() => ({
//       subcategories: v.array(Category),
//     }))
//     .extend({
//       name: v.string,
//     });

//   const untypedCategory: any = {
//     name: "Category A",
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory); // parses successfully
// });
