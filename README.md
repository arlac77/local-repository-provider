[![npm](https://img.shields.io/npm/v/local-repository-provider.svg)](https://www.npmjs.com/package/local-repository-provider)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/local-repository-provider)](https://bundlephobia.com/result?p=local-repository-provider)
[![downloads](http://img.shields.io/npm/dm/local-repository-provider.svg?style=flat-square)](https://npmjs.org/package/local-repository-provider)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/local-repository-provider.svg?style=flat-square)](https://github.com/arlac77/local-repository-provider/issues)
[![Build Status](https://travis-ci.com/arlac77/local-repository-provider.svg?branch=master)](https://travis-ci.com/arlac77/local-repository-provider)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/local-repository-provider.git)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/local-repository-provider/badge.svg)](https://snyk.io/test/github/arlac77/local-repository-provider)
[![Coverage Status](https://coveralls.io/repos/arlac77/local-repository-provider/badge.svg)](https://coveralls.io/r/arlac77/local-repository-provider)

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
    -   [attributes](#attributes)
-   [LocalRepository](#localrepository)
    -   [Properties](#properties-1)
    -   [condensedName](#condensedname)
    -   [setCurrentBranch](#setcurrentbranch)
        -   [Parameters](#parameters-1)
    -   [refId](#refid)
        -   [Parameters](#parameters-2)
    -   [initializeBranches](#initializebranches)
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

**Extends SingleGroupProvider**

Provider using native git executable
Known environment variables

-   GIT_CLONE_OPTIONS

### Properties

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### newWorkspacePath

Generate path for a new workspace
For the livetime of the provider always genrate new names

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** path

### repository

Using provider workspace and number of repositories to create repository workspace

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** where to place the repos workspace @see #newWorkspacePath

### attributes

Default configuration options

-   workspace
-   cloneOptions defaults to ["--depth", "8", "--no-single-branch"]

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## LocalRepository

**Extends Repository**

### Properties

-   `workspace` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `currentBranch` **Branch** 

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

### initializeBranches

build lookup of all remote branches

```sh
git ls-remote --heads
```

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

Executes:

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

Search for path in the branch

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **Entry** matching branch path names

### maybeEntry

Search for path in the branch

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
