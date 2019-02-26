[![npm](https://img.shields.io/npm/v/local-repository-provider.svg)](https://www.npmjs.com/package/local-repository-provider)
[![Greenkeeper](https://badges.greenkeeper.io/arlac77/local-repository-provider.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/local-repository-provider)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://secure.travis-ci.org/arlac77/local-repository-provider.png)](http://travis-ci.org/arlac77/local-repository-provider)
[![codecov.io](http://codecov.io/github/arlac77/local-repository-provider/coverage.svg?branch=master)](http://codecov.io/github/arlac77/local-repository-provider?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/local-repository-provider/badge.svg)](https://snyk.io/test/github/arlac77/local-repository-provider)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/local-repository-provider.svg?style=flat-square)](https://github.com/arlac77/local-repository-provider/issues)
[![Stories in Ready](https://badge.waffle.io/arlac77/local-repository-provider.svg?label=ready&title=Ready)](http://waffle.io/arlac77/local-repository-provider)
[![Dependency Status](https://david-dm.org/arlac77/local-repository-provider.svg)](https://david-dm.org/arlac77/local-repository-provider)
[![devDependency Status](https://david-dm.org/arlac77/local-repository-provider/dev-status.svg)](https://david-dm.org/arlac77/local-repository-provider#info=devDependencies)
[![docs](http://inch-ci.org/github/arlac77/local-repository-provider.svg?branch=master)](http://inch-ci.org/github/arlac77/local-repository-provider)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![downloads](http://img.shields.io/npm/dm/local-repository-provider.svg?style=flat-square)](https://npmjs.org/package/local-repository-provider)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# local-repository-provider

repository provider using local (native) git commands

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [LocalProvider](#localprovider)
    -   [Properties](#properties)
    -   [newWorkspacePath](#newworkspacepath)
    -   [repository](#repository)
        -   [Parameters](#parameters)
    -   [optionsFromEnvironment](#optionsfromenvironment)
        -   [Parameters](#parameters-1)
    -   [defaultOptions](#defaultoptions)
-   [LocalRepository](#localrepository)
    -   [Properties](#properties-1)
    -   [\_initialize](#_initialize)
        -   [Parameters](#parameters-2)
    -   [refId](#refid)
        -   [Parameters](#parameters-3)
-   [workspace](#workspace)
-   [LocalBranch](#localbranch)
    -   [Properties](#properties-2)
    -   [writeEntries](#writeentries)
        -   [Parameters](#parameters-4)
    -   [commit](#commit)
        -   [Parameters](#parameters-5)
    -   [entries](#entries)
        -   [Parameters](#parameters-6)
    -   [entry](#entry)
        -   [Parameters](#parameters-7)

## LocalProvider

**Extends Provider**

Provider using native git executable

### Properties

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### newWorkspacePath

Generate path for a new workspace
For the livetime of the provider always genrate new names

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path

### repository

using provider workspace and number of repositories to create repository workspace

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### optionsFromEnvironment

-   GIT_CLONE_OPTIONS

#### Parameters

-   `env`  

### defaultOptions

Default configuration options

-   workspace
-   cloneOptions

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## LocalRepository

**Extends Repository**

### Properties

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### \_initialize

exec git clone or git pull

#### Parameters

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### refId

Get sha of a ref
Calls

```sh
git show-ref <ref>
```

#### Parameters

-   `ref` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** sha of the ref

## workspace

workspace directory.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## LocalBranch

**Extends Branch**

### Properties

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### writeEntries

writes Entry into the branch

#### Parameters

-   `entry` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Entry>** 

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Entry>>** written entries

### commit

Excutes:

-   writes all updates into the workspace
-   git add
-   git commit
-   git push

#### Parameters

-   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** commit message
-   `entries` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Entry>** file entries to be commited
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### entries

Search for patch in the branch

#### Parameters

-   `matchingPatterns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**  (optional, default `["**/.*","**/*"]`)

Returns **Iterable&lt;Entry>** matching branch path names

### entry

Search for patch in the branch

#### Parameters

-   `name`  

Returns **Entry** matching branch path names

# install

With [npm](http://npmjs.org) do:

```shell
npm install local-repository-provider
```

# license

BSD-2-Clause
