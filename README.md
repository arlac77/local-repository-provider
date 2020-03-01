[![npm](https://img.shields.io/npm/v/local-repository-provider.svg)](https://www.npmjs.com/package/local-repository-provider)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/local-repository-provider)](https://bundlephobia.com/result?p=local-repository-provider)
[![downloads](http://img.shields.io/npm/dm/local-repository-provider.svg?style=flat-square)](https://npmjs.org/package/local-repository-provider)
[![Build Status](https://secure.travis-ci.org/arlac77/local-repository-provider.png)](http://travis-ci.org/arlac77/local-repository-provider)
[![Greenkeeper](https://badges.greenkeeper.io/arlac77/local-repository-provider.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/local-repository-provider)
[![codecov.io](http://codecov.io/github/arlac77/local-repository-provider/coverage.svg?branch=master)](http://codecov.io/github/arlac77/local-repository-provider?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Coverage Status](https://coveralls.io/repos/arlac77/local-repository-provider/badge.svg)](https://coveralls.io/r/arlac77/local-repository-provider)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/local-repository-provider/badge.svg)](https://snyk.io/test/github/arlac77/local-repository-provider)

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
    -   [environmentOptions](#environmentoptions)
    -   [defaultOptions](#defaultoptions)
-   [LocalRepository](#localrepository)
    -   [Properties](#properties-1)
    -   [\_initialize](#_initialize)
    -   [\_fetchBranches](#_fetchbranches)
    -   [condensedName](#condensedname)
    -   [setCurrentBranch](#setcurrentbranch)
        -   [Parameters](#parameters-1)
    -   [refId](#refid)
        -   [Parameters](#parameters-2)
-   [workspace](#workspace)
-   [LocalBranch](#localbranch)
    -   [Properties](#properties-2)
    -   [writeEntries](#writeentries)
        -   [Parameters](#parameters-3)
    -   [commit](#commit)
        -   [Parameters](#parameters-4)
    -   [entries](#entries)
        -   [Parameters](#parameters-5)
    -   [entry](#entry)
        -   [Parameters](#parameters-6)
    -   [maybeEntry](#maybeentry)
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
-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** where to place the repos workspace @see #newWorkspacePath

### environmentOptions

-   GIT_CLONE_OPTIONS

### defaultOptions

Default configuration options

-   workspace
-   cloneOptions defaults to ["--depth", "10", "--no-single-branch"]

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## LocalRepository

**Extends Repository**

### Properties

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `currentBranch` **Branch** 

### \_initialize

exec git clone or git pull

### \_fetchBranches

build lookup of all remote branches

```sh
git ls-remote --heads
```

### condensedName

most significant part of the url
remove trailing .git
only use last directory of pathname

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** name

### setCurrentBranch

Set the current active branch (workspace)

#### Parameters

-   `branch` **Branch** 

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

writes ContentEntries into the branch

#### Parameters

-   `entries` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;ContentEntry>** 

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;ContentEntry>>** written entries

### commit

Excutes:

-   writes all updates into the workspace
-   git add
-   git commit
-   git push --set-upstream origin

#### Parameters

-   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** commit message
-   `entries` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;ContentEntry>** file entries to be commited
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

### entries

Search for patch in the branch

#### Parameters

-   `matchingPatterns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**  (optional, default `["**/.*","**/*"]`)

Returns **Iterable&lt;Entry>** matching branch path names

### entry

Search for patch in the branch

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **Entry** matching branch path names

### maybeEntry

Search for patch in the branch

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **Entry** matching branch path names

# install

With [npm](http://npmjs.org) do:

```shell
npm install local-repository-provider
```

# license

BSD-2-Clause
