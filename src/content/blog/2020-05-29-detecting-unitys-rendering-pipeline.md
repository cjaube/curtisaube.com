---
title: "Determine Unity's Rendering Pipeline at Compile Time"
date: 2020-05-29
categories: 
  - "game-development"
tags: 
  - "define-directive"
  - "rendering-pipeline"
  - "srp"
  - "unity"
  - "urp"
coverImage: "dark-brewing-room-with-pipes.jpg"
---

I've been updating my [Smooth Screen Transition](https://assetstore.unity.com/packages/tools/gui/smooth-scene-transition-55812) asset to support VR in Unity's new Universal Rendering Pipeline (URP). Since Screen Space UI doesn't work with VR and you can't use the [GL](https://docs.unity3d.com/ScriptReference/GL.html) api with URP, I needed to look for an alternative and found [this bit of code](https://gist.github.com/phi-lira/46c98fc67640cda47dcd27e9b3765b85) that uses Unity's [CommandBuffer](https://docs.unity3d.com/ScriptReference/Rendering.CommandBuffer.html) to draw a full screen quad to the camera. This is fine, but it relies on a library (UnityEngine.Rendering.Universal) that's only there when URP is installed. So, of course, we need to wrap our using statement in a [#define directive](https://docs.unity3d.com/Manual/PlatformDependentCompilation.html) for URP, but alas, there isn't one.

So how can we make our asset support two rendering pipelines when there's no #define directive? We make our own #define directive. To start, we need to make an editor script that runs when Unity starts up. For that we use [InitializeOnLoad](https://docs.unity3d.com/Manual/RunningEditorCodeOnLaunch.html).

```csharp
[InitializeOnLoad]
public class RenderingPipelineDefines
{
    static RenderingPipelineDefines()
    {
        // Update Defines
    }
}
```

Notice the static constructor. Now we place this file in an Editor directory and it will run anytime you start Unity or change build targets (Not when changing pipelines, unfortunately). Next we need to be able to update our #define directives. To do that, we use the PlayerSettings.GetScriptingDefineSymbolsForGroup and PlayerSettings.SetScriptingDefineSymbolsForGroup methods. These methods take a build target group, so we'll just look up the active build target for that.

```csharp
    public static List<string> GetDefines()
    {
        var target = EditorUserBuildSettings.activeBuildTarget;
        var buildTargetGroup = BuildPipeline.GetBuildTargetGroup(target);
        var defines = PlayerSettings.GetScriptingDefineSymbolsForGroup(buildTargetGroup);
        return defines.Split(';').ToList();
    }

    public static void SetDefines(List<string> definesList)
    {
        var target = EditorUserBuildSettings.activeBuildTarget;
        var buildTargetGroup = BuildPipeline.GetBuildTargetGroup(target);
        var defines = string.Join(";", definesList.ToArray());
        PlayerSettings.SetScriptingDefineSymbolsForGroup(buildTargetGroup, defines);
    }
```

Now adding and removing from the list is just a matter of updating the list of strings. To actually detect what pipeline is running we will use a combination of unity version #define directives and checking the GraphicsSettings.renderPipelineAsset. I lifted some code from a [form answer](https://forum.unity.com/threads/how-to-know-if-i-have-the-lwrp-hdrp-api-at-compile-time.546513/#post-5553718) to a similar question. Here's the important code:

```csharp
    enum PipelineType
    {
        Unsupported,
        BuiltInPipeline,
        UniversalPipeline,
        HDPipeline
    }

    static PipelineType GetPipeline()
    {
#if UNITY_2019_1_OR_NEWER
        if (GraphicsSettings.renderPipelineAsset != null)
        {
            // SRP
            var srpType = GraphicsSettings.renderPipelineAsset.GetType().ToString();
            if (srpType.Contains("HDRenderPipelineAsset"))
            {
                return PipelineType.HDPipeline;
            }
            else if (srpType.Contains("UniversalRenderPipelineAsset") || srpType.Contains("LightweightRenderPipelineAsset"))
            {
                return PipelineType.UniversalPipeline;
            }
            else return PipelineType.Unsupported;
        }
#elif UNITY_2017_1_OR_NEWER
        if (GraphicsSettings.renderPipelineAsset != null) {
            // SRP not supported before 2019
            return PipelineType.Unsupported;
        }
#endif
        // no SRP
        return PipelineType.BuiltInPipeline;
    }
```

Putting this all together, we can check the current pipeline and add or remove from the list of defines. Then we can wrap any code in our new #define directives wherever they are needed.

```csharp
#if UNITY_PIPELINE_URP
using UnityEngine.Rendering.Universal;
#endif
```

Check out the [full source](https://gist.github.com/cjaube/944b0d5221808c2a761d616f29deaf49) and let me know what you think in the comments.
