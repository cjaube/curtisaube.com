---
title: "RTF Writer in Progress OpenEdge"
date: 2020-07-10
category: tech
tags: 
  - "interfaces"
  - "openedge"
  - "progress"
  - "rtf"
coverImage: /img/blog/balance-macro-ocean-pebbles-235990.jpg
---

Today we are going to look at creating an RTF writer in OpenEdge. But first, what is an RTF and why would we want to make a writer for it?

RTF is a proprietary file format for rich text created by Microsoft in 1987. It is still a standard but is not likely to receive any updates to the specification. Many programs can read and write to RTF which makes the format very portable, which is good if you don't want to export to a lot of different formats.

So before we go and create an RTF writer, we should get a basic understanding of the structure of an RTF file. To do that, I used [RTF Pocket Guide from O'Reilly](https://www.oreilly.com/library/view/rtf-pocket-guide/9781449302047/ch01.html). This will help us figure out what we want the interface to look like.

Let's take a look as some sample RTF text:

```apacheconf
{\rtf1\ansi\deff0 {\fonttbl {\f0 Times New Roman;}}
{\colortbl
;
\red255\green0\blue0;
\red0\green255\blue255;
}
\deflang1033\plain\fs24\margl1800\margr1800
{\pard\qc\sb240 This {\cf2\strike is} {\i a} {\b test}.\par}
}
```

The document opens with some initial information, a list of fonts, a list of colors, a little more information about the document, and then the actual content. The content is wrapped in a paragraph container ({\\pard ... \\par}) and there are groups inside of that ({ ... }). The backslashes denote commands.

Imagining what the interface might look like we could write code like this:

```c
def var outText as char no-undo.
def var doc as RTFDocument no-undo.
def var par as RTFParagraph no-undo.

doc = new RTFDocument().

par = doc:AddParagraph().
par:TextAlign = "center".
par:AddText("This is a test").

outText = doc:Output().

message outText view-as alert-box.
```

Of course, this code won't do anything because RTFDocument and RTFParagraph don't exist, but it gives us a good starting point.

We can create a class called RTFDocument, but we'll need a way to output a variety of classes. To do this we'll make use of an interface. Let's call it IRTFDocumentPart.

```c
using Progress.Lang.*.

interface RTFWriter.IRTFDocumentPart:  
  method public longchar Output().
end interface.
```

Now, when we create our RTFDocument class, we can iterate over a List of IRTFDocumentPart objects to create our final output.

```c
using Progress.Lang.*.
using OpenEdge.Core.Collections.*.

block-level on error undo, throw.

class RTFWriter.RTFDocument: 
  
  def var DocumentParts as List no-undo.

  constructor public RTFDocument():
    DocumentParts = new List().
  end constructor.

  /**
   * Purpose: Add a new paragraph to the document
   * @return the newly created pargarph
   */
  method public RTFParagraph AddParagraph():
    def var par as RTFParagraph no-undo.
    
    par = new RTFParagraph().
    DocumentParts:Add(par).
    
    return par.
  end method.

  /**
   * Output the Container
   */
  method public longchar Output(  ):
    def var outText as longchar no-undo.
    
    outText = OutputOpen() + OutputParts() + OutputClose().
    
    return outText.
  end method.

  /**
   * Output the parts withing this group
   */
  method protected longchar OutputParts():
    def var outText as longchar no-undo.
    def var partsIterator as IIterator no-undo.
    def var part as IRTFDocumentPart no-undo.

    partsIterator = DocumentParts:Iterator().
    do while partsIterator:HasNext():
      part = cast(partsIterator:Next(), IRTFDocumentPart).
      outText = outText + part:Output().
    end.

    return outText.
  end method.

  /**
   * Output the open text
   */
  method protected override character OutputOpen():
    return "~{\rtf1\ansi\deff0 ~{\fonttbl ~{\f0 Times New Roman;}}"
  end method.
  
  /**
   * Output the close text
   */
  method protected override character OutputClose():
    return "}~n".
  end method.
end class.
```

A basic RTFParagraph class might look something like this:

```c
using Progress.Lang.*.

block-level on error undo, throw.

class RTFWriter.RTFParagraph implements IDocumentPart: 

  define public property Content as char no-undo public get. public set.

  constructor public RTFParagraph(content as char):
    this-object:Content = content.
  end constructor.

  /**
   * Output the Group
   */
  method public character Output(  ):
    def var outText as longchar no-undo.

    outText = OutputOpen() + commands + OutputParts() + OutputClose().
    
    return outText.
  end method.
  
  /**
   * Output the RTF commands
   */
  method protected character OutputCommands():
    return "". // TODO: Output paragraph commands
  end method.
  
  /**
   * Output the open text
   */
  method protected character OutputOpen():
    return "~{\pard ".
  end method.
  
  /**
   * Output the close text
   */
  method protected character OutputClose():
    return " \par}~n".
  end method.

end class.
```

Now we can add paragraphs to our document, but paragraphs can contain a lot more than just text, so we'll need to add similar methods to add things like groups, text, and hyperlinks to our paragraph. One way to do this without creating a bunch of duplicate code is to use inheritance. We can create a base class that contains all the methods to add document parts and then our subclasses can inherit those procedures.

Once we've created our base class, we can just fill in the rest of the document parts. Each one provides a slightly different output that may include child outputs. When we call RTFDocument's Output method, the entire document gets constructed. Feel free to use the completed [source](https://github.com/cjaube/OpenEdgeUtilities/tree/master/source/RTFWriter) that also includes support for tables and hyperlinks!

Note that RTF documents have a standard, but there are also conventions and best practices. When I wrote this RTF writer, I focused on making the output match the conventions over allowing every possibility afforded by the standard. This way, someone using the library doesn't have to be familiar with the intricacies of the standard and can just focus on their content, structure, and styles. For instance, table cells don't have to have a group in them, but it is a best practice to prevent styles from leaking out, so I made cells always have a group. To simplify the code, I just made the RTFCell class inherit from the RTFGroup class.

Like and comment below. Thanks!
