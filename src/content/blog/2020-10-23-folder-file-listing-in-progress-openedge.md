---
title: "Folder File listing in Progress OpenEdge"
date: 2020-10-23
category: tech
tags: 
  - "filesystem"
  - "folder"
  - "listing"
  - "openedge"
  - "progress"
  - "search"
coverImage: /img/blog/pexels-element-digital-1370294.jpg
---

I had a case where I need to get a listing of all the procedures in a folder and run each one. ABL has a nifty search function that you can use to find a file, but there is no way to search for a folder or get a listing of files. So this it what I set out to build.

As you may know, Progress OpenEdge supports searching and running files from the filesystem or from a library file. All of the locations that it searches are defined in the propath. The first one it finds is the one you get. Now, we will need to create a new search that looks for folders, but before we do that, let's look at how we might get a listing from the filesystems or a library.

The filesystem is pretty straightforward.

```c
  define stream FileStream.

  method private static char GetDirectoryListingFromFilesystem(directoryPath as char):
    def var directoryListing as char no-undo.
    def var path as char no-undo.
    def var cFileName as char no-undo.
    def var fileType as char no-undo.

    input stream FileStream from os-dir(directoryPath).
    
    repeat:
      import stream FileStream cFileName path fileType.
    
      if path <> ? and path <> "" and fileType = "F"
 then do:
        if directoryListing <> "" then directoryListing = directoryListing + ",".
        directoryListing = directoryListing + path. 
      end.
    end.
    
    input stream FileStream close. 
    
    return directoryListing.
  end method.
```

Given a standard directory path, we loop through the directory items making sure that they are in fact files. We batch that up in a comma-separated list and return it.

The library file is a little different. First of all, a file in a library comes in the form `LibraryPath<<MemeberPath>>`. Folders don't really exist in a library, but for simplicities sake, we will use the same form to represent the collection of files we are looking for. This allows us to use the `library` and `member` commands to parse the path.

For traversing the contents of the library file, we will use prolib. This is a command-line tool that comes with a OpenEdge, so we will need to locate and invoke it. This [knowledgebase article](https://knowledgebase.progress.com/articles/Article/21301) was really helpful in determining how to read out the file names.

```c
  method private static char GetDirectoryListingFromLibrary(directoryPath as char):
    def var directoryListing as char no-undo.
    def var ix as int no-undo.
    def var path as char no-undo.
    def var fullPath as char no-undo.
    def var libraryPath as char no-undo.
    def var memberPath as char no-undo.
    
    assign
      libraryPath = library(directoryPath)
      memberPath = member(directoryPath).

    input through value("%DLC%\bin\prolib.exe " + libraryPath + " -list " + memberPath + "*").
    
    repeat:
      import unformatted path.
      if trim(path) = "" then leave.
      
      if path begins memberPath then do:
        if directoryListing <> "" then directoryListing = directoryListing + ",".
        
        // Trim off extra data
        do ix = 1 to 7: 
          entry(num-entries(path," "),path," ") = "".
          path = right-trim(path).
        end.
        
        fullPath = libraryPath + "<<" + path + ">>".
        
        directoryListing = directoryListing + fullPath.
      end.
    end.
    
    return directoryListing.
  end method.
```

Notice that we output the file paths in the proper library form. This will allow us to run them without doing another search for the file.

Great! Now that we can get file listings, we just need to mimic the behavior of search, but for folders. Since we are trying to get a file listing, we are going to only search for non-empty folders.

Here's what our directory search looks like.

```c
  method public static char SearchDirectory(directorySearch as char):
    def var ix as int no-undo.
    def var propathEntry as char no-undo.
    def var path as char no-undo.
    
    // Clean up and normalize the directory search
    directorySearch = replace(directorySearch,"\","/").
    if directorySearch begins "/" then
      directorySearch = substring(directorySearch, 2, length(directorySearch) - 1).
    if not directorySearch matches "*/" then
      directorySearch = directorySearch + "/".
    
    do ix = 1 to num-entries(propath):
      propathEntry = entry(ix, propath).
      
      // Check if the directory exists. See https://knowledgebase.progress.com/articles/Article/000040232
      if propathEntry matches "*.pl" then do:
        // This is a library.
        file-info:filename = propathEntry + "<<" + directorySearch + ">>".
        if file-info:full-pathname <> ? and not IsLibraryDirectoryEmpty(file-info:full-pathname) then
          return file-info:full-pathname.
      end.
      else do:
        // Filesystem location.
        file-info:filename = propathEntry + "/" + directorySearch.
        if file-info:full-pathname <> ? and not IsFilesystemDirectoryEmpty(file-info:full-pathname) then
          return file-info:full-pathname.
      end.
    end.
    
    return ?.
  end method.
```

We loop through the propath entries looking for valid non-empty directories. We make use of file-info to check that the folder exists (Note: a library check will always return true as long as the library itself exists). Finally, we check to make sure the directory isn't empty.

You'll notice that we haven't created IsLibraryDirectoryEmpty or IsFilesystemDirectoryEmpty yet. We could just use our directory listing methods, but we can make them a little more efficient than that. They don't need to return a listing and they don't need to find more than one file.

```c
  method private static log IsLibraryDirectoryEmpty(directoryPath as char):
    def var path as char no-undo.
    def var libraryPath as char no-undo.
    def var memberPath as char no-undo.
    
    assign
      libraryPath = library(directoryPath)
      memberPath = member(directoryPath).

    // Search the library path for a file
    input through value("%DLC%\bin\prolib.exe " + libraryPath + " -list " + memberPath + "*").
    repeat:
      import unformatted path.
      if trim(path) = "" then leave.

      if path begins  memberPath then
        return false.
    end.
    return true.
  end.
  
  method private static log IsFilesystemDirectoryEmpty(directoryPath as char):
    def var foundFile as log no-undo.
    def var path as char no-undo.
    def var cFileName as char no-undo.
    def var fileType as char no-undo.
    
    input stream FileStream from os-dir(directoryPath).
    
    repeat:
      import stream FileStream cFileName path fileType.
    
      if path <> ? and path <> "" and fileType = "F" then do:
        input stream FileStream close. 
        return false.
      end.
    end.
    
    return true.
  end.
```

Now that we can search for non-empty directories, we can put it all together!

```c
  method public static char GetDirectoryListing(directoryPath as char):
    def var searchDirectoryResult as char no-undo.
    def var directoryListing as char no-undo.
    
    searchDirectoryResult = SearchDirectory(directoryPath).
    
    if searchDirectoryResult <> ? then do:
      if library(searchDirectoryResult) <> ? then 
        return GetDirectoryListingFromLibrary(searchDirectoryResult).
      else
        return GetDirectoryListingFromFilesystem(searchDirectoryResult).
    end.
    
    return ?.
  end method.
```

We search for a non-empty directory, check if it is a library or the filesystem, and call the corresponding directory listing method.

And that's it! We talked about the propath, prolib, and library structures; and we created a slick way to get a directory listing. As a bonus, we now have a convenient DirectorySearch method to find non-empty directories if we ever need it. I wrapped this all up in a FileUtil.cls file.

Hope you enjoyed this entry. Thought of another way of solving this issue? I'd love to know! Please comment or like below!
