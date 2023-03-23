import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vLateObject, vLazy, vObject } from '../../src/types/object'
import { vArray, vNullInstance, vUnion } from '../../src/types/init'
import { vNumberInstance } from '../../src/types/number'

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

it('recursion with z.late.object', () => {
  const category = vLateObject(() => ({
    name: vStringInstance,
    subcategories: vArray(category),
  }))
  const y = category.parse(testCategory)
  console.log(y)
})

it('recursion with vLazy', () => {
  const category = vLazy(() =>
    vObject({
      name: vStringInstance,
      subcategories: vArray(category),
    }),
  )
  category.parse(testCategory)
})

// it('schema getter', () => {
//   vLazy(() => vStringInstance).schema.parse('asdf')
// })

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

it.only('recursion involving union type', () => {
  const linkedListSchema: z.ZodType<LinkedList> = vLazy(() =>
    vUnion([
      vNullInstance,
      vObject({
        value: vNumberInstance,
        next: linkedListSchema,
      }),
    ]),
  )
  linkedListSchema.parse(linkedListExample)
})

// interface A {
//   val: number;
//   b: B;
// }

// interface B {
//   val: number;
//   a: A;
// }

// const A: z.ZodType<A> = z.late.object(() => ({
//   val: vNumberInstance,
//   b: B,
// }));

// const B: z.ZodType<B> = z.late.object(() => ({
//   val: vNumberInstance,
//   a: A,
// }));

// const Alazy: z.ZodType<A> = vLazy(() => vObject({
//   val: vNumberInstance,
//   b: B,
// }));

// const Blazy: z.ZodType<B> = vLazy(() => vObject({
//   val: vNumberInstance,
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
//       val: vNumberInstance,
//       b: z
//         .object({
//           val: vNumberInstance,
//           a: z
//             .object({
//               val: vNumberInstance,
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
//   (A as z.ZodLazy<any>).schema;
// });

// it("self recursion with cyclical data", () => {
//   interface Category {
//     name: string;
//     subcategories: Category[];
//   }

//   const Category: z.ZodType<Category> = z.late.object(() => ({
//     name: vStringInstance,
//     subcategories: vArray(Category),
//   }));

//   const untypedCategory: any = {
//     name: "Category A",
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory);
// });

// it("self recursion with base type", () => {
//   const BaseCategory = vObject({
//     name: vStringInstance,
//   });
//   type BaseCategory = z.infer<typeof BaseCategory>;

//   type Category = BaseCategory & { subcategories: Category[] };

//   const Category: z.ZodType<Category> = z.late
//     .object(() => ({
//       subcategories: vArray(Category),
//     }))
//     .extend({
//       name: vStringInstance,
//     });

//   const untypedCategory: any = {
//     name: "Category A",
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory); // parses successfully
// });
