---
title: "Collections in Progress OpenEdge"
date: 2020-07-17
categories: 
  - "progress-openedge"
tags: 
  - "abl"
  - "collections"
  - "extent"
  - "generics"
  - "openedge"
  - "progress"
coverImage: "selective-focus-photography-of-brown-wooden-book-shelf-2952871.jpg"
---

Collections are a bit of a sticky subject in Progress. The reason for this is that Progress doesn't currently support Generics. Why does that matter? Generics make it so that you can handle types in a generic way. Without that language feature, you can't easily have typed collections, but not all is lost. Let's take a look at the options we have and why types matter.

_But before we start, I'll just point out that I'm focusing on Collections of objects, not primitives. Progress already has a good way of dealing with lists of strings (via lookup, num-entries, and entry functions) for example._

## 1\. Extents

If you are familiar with other languages, extents are like typed arrays. You can even store objects in them just fine. The catch is that you must specify the type AND size of the extent before you start using it. You could wrap an extent in an object that dynamically resized the extent (by copying the contents to a larger extent), but in order to make it support different types, you would need that handy language feature called generics.

Let's look at an example. Let's say we have a list of cells in a row. We know how many cells there are per row (rowSize), so we can use an extent.

```c
// Create the extent variable
define variable cells as ReportTableCell extent no-undo

// Set the size of the extent before adding anything to it.
extent(cells) = rowSize.

// Add something to our extent
cells[cellIndex] = new TableCell().
cellIndex = cellIndex + 1.
```

The syntax is a little funny, but it does the job. Unfortunately, If you are in a situation where you don't know what the size needs to be ahead of time, this isn't a very good solution.

## 2\. Singly Linked Lists

I mention singly linked lists because they are very simple to setup, can be typed, and can be of unknown size. Let's say we have a class called ReportTableRow and it has a property called NextRow of type ReportTableRow.

```c
class ReportTableRow: 
  define public property NextRow as ReportTableRow no-undo public get. public set.
end class.
```

Now to store our list, we just need a reference to the head (FirstRow) and tail (LastRow) of our linked list. When we add a new row, we just need to set the NextRow of the LastRow and update LastRow to point to the newly added row.

```c
class ReportTableRowList: 
  define public property FirstRow as ReportTableRow public get. public set.
  define public property LastRow as ReportTableRow public get. public set.
  define public property RowCount as integer init 0 public get. private set.
  
  /*------------------------------------------------------------------------------
   Purpose: Insert a row at the end of the list.
   @param tableRow The table row to insert.
  ------------------------------------------------------------------------------*/
  method public void InsertLastRow(tableRow as ReportTableRow):
    if FirstRow = ? then do:
      FirstRow = tableRow.
      LastRow = tableRow.
    end.
    else do:
      LastRow:NextRow = tableRow.
      LastRow = tableRow.
    end.
    RowCount = RowCount + 1.
  end method.
end class.
```

Once we've added some rows, to loop over the list, we just just keep grabbing NextRow until it gives us the unknown value.

```c
def var currentRow as ReportTableRow no-undo.
currentRow = TableRowList:FirstRow.
do while currentRow <> ?:
  // Do something with currentRow
  currentRow = currentRow:NextRow.
end.
```

This is great, but you can probably see the drawbacks. You need to create one of these list classes for each type (once again, no generics) and you need to store the next property in the class you are iterating over. Not to mention the drawbacks of singly linked lists themselves being that you can only go in one direction and can't jump to specific indexes, but if that's all you need, this is lightweight and would do the job.

## 3\. Collection Libraries

Progress OpenEdge has some nice collection libraries available. The main problem is that they are not typed. Let's look at how to use one and then we'll talk about why not having types in a problem.

```c
using OpenEdge.Core.Collections.*.

// Create the list
define variable cells as List no-undo.
cells = new List().

// Add something to it
define variable cell as ReportTableCell no-undo.
cell = new ReportTableCell().
cells:Add(cell).

// Iterate over our list
define variable cellIterator as IIterator no-undo.
cellIterator = cells:Iterator().
do while cellIterator:HasNext():
  cell = cast(cellIterator:Next(), ReportTableCell).
  // Do something with cell
end.
```

This looks great! We don't need to know the size ahead of time and we can iterate over our objects without adding anything to our classes, but now we have to cast our items when we pull them out. Aside from adding a small performance hit, this means that if we put a different type of object in this collection that isn't comparable with what we are casting to, we will get a runtime error. Runtime errors aren't great. It's much better to catch errors at compile-time if we can. This is why typed collections are so beneficial.

## Conclusion

So none of these have been perfect. Each has advantages and disadvantages. I've heard rumors of a way to mimic generics by using include files, but I haven't quite figured that one out yet. So I'm still on the hunt for the perfect collections solution. If you have another way I haven't thought of please share!

Do like and comment below and let me know if there's a topic you'd like to discuss!
