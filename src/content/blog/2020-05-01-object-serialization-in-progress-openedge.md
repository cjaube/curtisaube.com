---
title: "Object Serialization in Progress OpenEdge"
date: 2020-05-01
category: tech
tags: 
  - "abl"
  - "openedge"
  - "progress"
  - "serialization"
coverImage: /img/blog/milk-being-poured-into-cereal-1.jpg
---

Since Progress version 11.7 we have the ability to serialize and deserialize class-based objects. What is serialization? Simply, it's the process of converting an object into a format that can be transmitted or stored and then remade into the object at a later time. As of this writing, json and binary formats are available.

So what does this allow us to do? Well, in my case, I wanted to gather information needed for a web page and then later use that data when constructing the requested page. It may also be useful for generating the return json for an API.

Whatever your use case is, these libraries are ready and available to use with a little bit of a catch that we'll discuss in a moment. But first, let's look at how to use it! (Example from [progress documentation](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvref/serialize\(-\)-method-\(jsonserializer\).html))

```c
def var myFileOutStream as Progress.IO.FileOutputStream no-undo.
def var myFileInStream as Progress.IO.FileInputStream no-undo.
def var mySerializer as Progress.IO.JsonSerializer no-undo.
// Or you could also use Progress.IO.BinarySerializer
def var myObject as SomePackage.MyClass no-undo.

// Serialize
myObject = new SomePackage.MyClass().
myFileOutStream = new Progress.IO.FileOutputStream("MyClass.json").
mySerializer:Serialize(myObj, myFileOutStream).
myFileOutStream:Close().

// Deserialize
myFileInStream = new Progress.IO.FileInputStream("MyClass.json").
myObject = cast(mySerializer:Deserialize(myFileInStream), SomePackage.MyClass).
myFileInStream:Close().
```

"Okay, that looks fine," you say, "but what if I don't want to save my object to a file? What if I wanted to save my object to a longchar?" Glad you asked! Unfortunately, Progress only provides the concrete classes for [FileOutputStream](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvref/progress.io.fileoutputstream-class.html) and [FileInputStream](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvref%2Fprogress.io.fileinputstream-class.html%23) at this time (This is the catch I was talking about earlier). But we aren't completely up the creek yet. Progress provides abstract classes [OutputSteam](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvref%2Fprogress.io.outputstream-class.html%23) and [InputStream](https://documentation.progress.com/output/ua/OpenEdge_latest/index.html#page/dvref%2Fprogress.io.inputstream-class.html%23). So off we go on an adventure to create our classes that implement OutputSteam and InputSteam and write and read from longchar.

Turns out I'm not the first person to want to do this. If we take a look at [Progress Knowledgebase Article 000067809](https://knowledgebase.progress.com/articles/Article/How-to-serialize-a-class-object-to-JSON-directly-into-a-LONGCHAR-variable), we see a nice implementation of the OutputStream for longchar.

```c
class StringOutputStream inherits Progress.IO.OutputStream:

  define public property OutputData AS lonchar get. private set.

  method override public int64 Write( input sourceData as memptr, input offset as int64, input length as int64 ):
    this-object:OutputData = get-string(sourceData, 1).
    return get-size(sourceData).
  end method.

  method override public int64 Write( input sourceData as longchar ):
  end method.

  method override public int64 Write( input sourceData as character ):
  end method.

end class.
```

And to use it, just:

```c
def var myStringOutStream as StringOutputStream no-undo.
def var mySerializer as Progress.IO.JsonSerializer no-undo.
def var myObject as SomePackage.MyClass no-undo.

// Serialize
myObject = new SomePackage.MyClass().
myStringOutStream = new StringOutputStream().
mySerializer:Serialize(myObj, myStringOutStream).
myFileOutStream:Close().

message string(myStringOutStream:OutputData) view-as alert-box.
```

So this is great, but there are a few problems: One, of course, is that we don't have a StringInputStream, but more importantly, 'get-string' has a 32k limit so you may find yourself running into this nasty error: "Attempt to exceed maximum size of a CHARACTER variable. (9324)." For more information on that, check out [Progress Knowledgebase Article 000018615](https://knowledgebase.progress.com/articles/Article/P188437).

So what do we do? Sounds like a job for copy-lob! Since copy-lob doesn't have a size limit, we should be able to use it to copy or data to the longchar.

```c
copy-lob from sourceData to OutputData.
```

Easy, right? Except that it doesn't work. If you're like me, you are greeted with the lovely error: "Invalid Character data found in MEMPTR for codepage ISO8859-1" (You might get a different error if you have your session codepage set differently). So this seems like an easy fix. Find out what the codepage is and set it, right? I couldn't find any info on what codepage the JsonSerializer uses, but "utf-8" is pretty common so, may as well give it a shot.

```c
copy-lob from sourceData to OutputData convert source codepage "utf-8".
```

Yay! New error! Here's what we have now: "Large object assign or copy failed. (11395)." I scratched my head for a while on this one. The error is not very descriptive. Fortunately, [Progress Knowledgebase Article 000010655](https://knowledgebase.progress.com/articles/Article/P110518) kind of clues you into what's going on here. One possible issue is that our sourceData memptr is larger than it needs to be and the remaining space is being filled with nulls. My suspicions were corroborated by the fact that my sourceData size was 65535 bytes (almost exactly 64kb) which seemed a little too round of a number.

So to solve this, I used a solution similar to [Progress Knowledgebase Article 000011180](https://knowledgebase.progress.com/articles/Article/P116459). Here's the final StringOutputStream.

```c
class StringOutputStream inherits Progress.IO.OutputStream: 

  def public property OutputData as longchar get. private set.
  
  method override public int64 Write( input sourceData as memptr, input offset as int64, input length as int64 ):
    def var sourceSize as int64 no-undo.
    def var counter as int64 no-undo.
    def var acsiiNumber as int no-undo.
    
    sourceSize = get-size(sourceData).
    
    do counter = 1 to sourceSize:
      acsiiNumber = get-byte(sourceData, counter).
      if acsiiNumber = 0 then leave.
      OutputData = OutputData + chr(acsiiNumber).
    end.
    
    return sourceSize.
  end method.

  method override public int64 Write( input sourceData as longchar ):
  end method.

  method override public int64 Write( input sourceData as character ):
  end method.

end class.
```

Now to wrap this up, we just need to make a matching StringInputStream. We can use copy-lob or put-string for this one no problem. Both support greater than 32K and will copy from a properly sized longchar.

```c
class StringInputStream inherits InputStream: 

  def public property SourceData as longchar get. private set.
  
  constructor public StringInputStream(sourceData as longchar):
    this-object:SourceData = sourceData.
  end constructor.

  method override public int64 Read( input targetData as memptr, input offset as int64, input length as int64 ):
    put-string(targetData, 1) = SourceData.
    return get-size(targetData).
  end method.

  method override public int64 Read( input delimiter0 as character, output target as longchar ):
  end method.

  method override public int64 Read( input delimiter0 as character, output target as character ):
  end method.

end class.
```

To use our new StringInputStream:

```c
def var myObjectData as longchar no-undo.

// Data is retrieved from somewhere and set to myObjectData

def var myStringInStream as StringInputStream no-undo.
def var mySerializer as Progress.IO.JsonSerializer no-undo.
def var myObject as SomePackage.MyClass no-undo.

// Deserialize
myStringInStream = new StringInputStream(myObjectData).
myObject = cast(mySerializer:Deserialize(myStringInStream), SomePackage.MyClass).
myStringInStream:Close().

// Now use myObject
```

And that's it! A bit of a rocky road, but we got there!

Thanks for reading! Check out the [source files](https://github.com/cjaube/OpenEdgeUtilities/tree/master/source/IO) and comment to let me know if you found this useful or how I might improve it.
