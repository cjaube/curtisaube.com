---
title: "XML in Progres OpenEdge"
date: 2020-08-21
categories: 
  - "progress-openedge"
tags: 
  - "openedge"
  - "progress"
  - "xml"
coverImage: "pexels-photo-437345.jpeg"
---

I recently had the need to work with some XML in Progress OpenEdge and found it to be a bit tricky, so I've compiled some of my discoveries here.

First off, what is XML anyway? It stands for Extensible Markup Language and it's purpose is for storing and transmitting structured information. It's used quite a lot including file formats and communication formats. You may notice that it looks a lot like HTML and while they aren't exactly the same, they share a lot of similarities.

There are multiple ways to work with XML in Progress OpenEdge. I'm going to show you three.

## DOM

Okay, so let's look at creating a simple XML document from scratch using the DOM method.

```c
def var hDoc as handle.
def var hRoot as handle.
def var hText as handle.
def var outText as longchar.

// Create the document and the root node
create x-document hDoc.
create x-noderef hRoot.
hDoc:create-node(hRoot, "Test", "element").
hRoot:set-attribute("Name", "Something").
hDoc:append-child(hRoot).

// Add some text to the root node
create x-noderef hText.
hDoc:create-node(hText, "", "text").
hText:node-value = "This is some text.".
hRoot:append-child(hText).

// Alert it
hDoc:save("longchar", outText).
message string(outText) view-as alert-box.

// Outputs:
//   <?xml version="1.0" ?>
//   <Test Name="Something">This is some text.</Test>
```

It feels a little funny that you have to create a separate node just for the text and then set the node-value, but I'm guessing maybe there's a reason for it.

It's also perhaps a bit verbose for such a small snippet of XML. Is there a faster way of constructing XML? Well, I'm glad you asked! We can construct XML from a longchar like so:

```c
def var person as longchar no-undo.
def var personDoc as handle no-undo.
def var personNode as handle no-undo.
def var outText as longchar.

// Store xml in a longchar
person = '<?xml version="1.0" ?>' +
  '<person gender="f" firstname="Carmon" lastname="Sandiego">' +
  	'<accessories>' +
  		'<accessory type="coat" color="red" fabric="suede">' +
  			'It is very stylish.' +
  		'</accessory>' +
  	'</accessories>' +
  '</person>'.

// Load the longchar in to an xml document
create x-document personDoc.
personDoc:load('longchar', person, false).
create x-noderef personNode.
personDoc:get-document-element(personNode).

// Alert it
personDoc:save("longchar", outText).
message string(outText) view-as alert-box.

// Outputs:
//  <?xml version="1.0" encoding="ISO-8859-1" ?>
//  <person firstname="Carmon" gender="f" lastname="Sandiego"><accessories><accessory color="red" fabric="suede" type="coat">It is very stylish.</accessory></accessories></person>
```

Check the [documentation](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvxml/loading-an-xml-file.html) for more ways you can load xml.

This is great, but sometimes you want to combine multiple snippets of XML. We can generate another block of XML the same way. We can try to append it to our document, but we'll get a weird error: "A node was used in a different document than the one the created it". So first we need to import the node from one document to the other.

```c
def var accessory as longchar no-undo.
def var accessoryDoc as handle no-undo.
def var accessoryNode as handle no-undo.
def var accessoriesNode as handle no-undo.
def var newAccessoryDoc as handle no-undo.
def var newAccessoryNode as handle no-undo.

// Store new xml in a new longchar
accessory = '<?xml version="1.0" ?>' +
  '<accessory type="hat" color="red" fabric="suede">' +
  	'It is her favorite' +
  '</accessory>'.

// Load the longchar in to another xml document
create x-document accessoryDoc.
accessoryDoc:load('longchar', accessory, false).
create x-noderef accessoryNode.
accessoryDoc:get-document-element(accessoryNode).

// Import the node
create x-noderef newAccessoryNode.
personDoc:import-node(newAccessoryNode, accessoryNode, yes).

// Add it to the first document
create x-noderef accessoriesNode.
personNode:get-child(accessoriesNode, 1).
accessoriesNode:append-child(newAccessoryNode).

// Alert it
personDoc:save("longchar", outText).
message string(outText) view-as alert-box.

// Outputs:
//  <?xml version="1.0" encoding="ISO-8859-1" ?>
//  <person firstname="Carmon" gender="f" lastname="Sandiego"><accessories><accessory color="red" fabric="suede" type="coat">It is very stylish.</accessory><accessory color="red" fabric="suede" type="hat">It is her favorite</accessory></accessories></person>
```

If you've followed my instructions thus far and you get a cryptic error message like, "A node was inserted where it doesn't belong," you probably have some whitespace between your elements causing extra text nodes to be created and it thinks you are trying to add an element to a text node.

## SAX

The Simple API for XML (SAX) is a little different than the DOM method. It provides you with three objects: SAX-reader, SAX-attributes, and SAX-writer. Rather than holding all the XML in memory as DOM does, you can read it in or write it out from top to bottom.

```c
def var sax-handle as handle no-undo.
def var outText as longchar no-undo.

create sax-writer sax-handle.

// Set the destination first
sax-handle:set-output-destination("longchar", outText).
sax-handle:formatted = true. 
sax-handle:start-document().

// Build the XML in a line-by-line fashion
sax-handle:start-element("person").
sax-handle:insert-attribute("Name", "Something").

sax-handle:write-empty-element("location").
sax-handle:insert-attribute("latitude", "55.953251").
sax-handle:insert-attribute("longitude", "-3.188267").

sax-handle:start-element("accessories").

sax-handle:start-element("accessory").
sax-handle:insert-attribute("color", "red").
sax-handle:insert-attribute("fabric", "suede").
sax-handle:insert-attribute("type", "coat").
sax-handle:write-characters("It is very stylish.").
sax-handle:end-element("accessory").

sax-handle:start-element("accessory").
sax-handle:insert-attribute("color", "red").
sax-handle:insert-attribute("fabric", "suede").
sax-handle:insert-attribute("type", "hat").
sax-handle:write-characters("It is her favorite.").
sax-handle:end-element("accessory").

sax-handle:end-element("accessories").

sax-handle:end-element("person").

// Alert it
message string(outText) view-as alert-box.

//Output:
//  <?xml version="1.0"?>
//  <person Name="Something">
//    <location latitude="55.953251" longitude="-3.188267"/>
//    <accessories>
//      <accessory color="red" fabric="suede" type="coat">It is very stylish.</accessory>
//      <accessory color="red" fabric="suede" type="hat">It is her favorite.</accessory>
//    </accessories>
//  </person>
```

One thing to note with this method is that you are responsible for closing the elements. So if you accidentally close a parent element before a child element, for instance, you'll get an error.

## .NET Libraries

There are also some .NET libraries that we can take advantage of. These are nice, especially if you are working with other .NET libraries as well.

I'll repeat an earlier example to give you an idea of the syntax.

```c
using System.Xml.*.

def var person as char no-undo.
def var personDoc as XmlDocument no-undo.
def var accessory as char no-undo.
def var accessoryDoc as XmlDocument no-undo.
def var accessoriesList as XmlNodeList no-undo.
def var accessoriesNode as XmlNode no-undo.
def var outText as longchar no-undo.
  
// Store xml in a char
person = '<?xml version="1.0" ?>' +
  '<person gender="f" firstname="Carmon" lastname="Sandiego">' +
  	'<accessories>' +
  		'<accessory type="coat" color="red" fabric="suede">' +
  			'It is very stylish.' +
  		'</accessory>' +
  	'</accessories>' +
  '</person>'.
  
// Load the char in to an xml document
personDoc = new XmlDocument().
personDoc:loadXml(person).
  
// Store new xml in a new char
accessory = '<?xml version="1.0" ?>' +
	'<accessory type="hat" color="red" fabric="suede">' +
  	'It is her favorite' +
  '</accessory>'.
  
// Load the char in to another xml document
accessoryDoc = new XmlDocument().
accessoryDoc:loadXml(accessory).

// Import the node and add it to the first document
accessoriesList = personDoc:GetElementsByTagName("accessories").
accessoriesNode = accessoriesList[0].
accessoriesNode:AppendChild(personDoc:ImportNode(accessoryDoc:DocumentElement, true)).

  
// Alert it
outText = personDoc:OuterXml.
message string(outText) view-as alert-box.
clipboard:value = outText.

//Outputs:
//  <?xml version="1.0"?><person gender="f" firstname="Carmon" lastname="Sandiego"><accessories><accessory type="coat" color="red" fabric="suede">It is very stylish.</accessory><accessory type="hat" color="red" fabric="suede">It is her favorite</accessory></accessories></person>
```

## Conclusion

Those were a few ways of working the OpenEdge XML libraries. You can find more info on the first two methods from the [documentation on reading and writing XML](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvxml%2Freading-and-writing-xml-with-the-document-object.html%23).

Hope you enjoyed this post. Please like and comment below.
