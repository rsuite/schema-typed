## [2.1.2](https://github.com/rsuite/schema-typed/compare/2.1.1...2.1.2) (2023-03-10)


### Bug Fixes

* **build:** fix unpublished source code ([#67](https://github.com/rsuite/schema-typed/issues/67)) ([c21ae0a](https://github.com/rsuite/schema-typed/commit/c21ae0a94578907e3fdd0467e5d1a1e3ec7c4d85))



## [2.1.1](https://github.com/rsuite/schema-typed/compare/2.1.0...2.1.1) (2023-03-08)

- chore: change the compilation target of TypeScript from esnext to es2019

# [2.1.0](https://github.com/rsuite/schema-typed/compare/2.0.4...2.1.0) (2023-03-02)

### Features

- addAsyncRule to allow sync and async rules to run ([#63](https://github.com/rsuite/schema-typed/issues/63)) ([574f9ad](https://github.com/rsuite/schema-typed/commit/574f9ad973af97b8c1bae44c3fcfa3dad608c4d6))

## [2.0.4](https://github.com/rsuite/schema-typed/compare/2.0.3...2.0.4) (2023-03-01)

### Bug Fixes

- promises where not allowed by type ([#61](https://github.com/rsuite/schema-typed/issues/61)) ([9cc665c](https://github.com/rsuite/schema-typed/commit/9cc665c4f72b5a22942d351c961263c179888a7a))

## [2.0.3](https://github.com/rsuite/schema-typed/compare/2.0.2...2.0.3) (2022-06-30)

### Bug Fixes

- **ObjectType:** specifies type of property `object` in the `ObjectType` check result ([#46](https://github.com/rsuite/schema-typed/issues/46)) ([0571e09](https://github.com/rsuite/schema-typed/commit/0571e097217b0c999acaf9e5780bdd289aa46a46))

# 2.0.2

- build(deps): add @babel/runtime #37

# 2.0.1

- fix ArrayType.of type error #35

# 2.0.0

- feat(locales): add default error messages for all checks ([#27](https://github.com/rsuite/schema-typed/issues/27)) ([03e21d7](https://github.com/rsuite/schema-typed/commit/03e21d77e9a6e0cd4fddcb1adfe8c485025f246b))
- refactor: refactor the project through typescript.
- feat(MixedType): Added support for `when` method on all types
- feat(MixedType): Replace Type with MixedType.
- feat(ObjectType): Support nested objects in the `shape` method of ObjectType.

# 1.5.1

- Update the typescript definition of `addRule`

# 1.5.0

- Added support for `isRequiredOrEmpty` in StringType and ArrayType

# 1.4.0

- Adding the typescript types declaration in to package

# 1.3.1

- Fixed an issue where `isOneOf` was not valid in `StringType` (#18)

# 1.3.0

- Added support for ESM

# 1.2.2

> Aug 30, 2019

- **Bugfix**: Fix an issue where addRule is not called

# 1.2.0

> Aug 20, 2019

- **Feature**: Support for async check. ([#14])

---

[#14]: https://github.com/rsuite/rsuite/pull/14
