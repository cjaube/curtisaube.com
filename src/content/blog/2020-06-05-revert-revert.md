---
title: "Revert, Revert!"
date: 2020-06-05
categories: 
  - "version-control"
tags: 
  - "git"
  - "revert"
  - "source-control"
  - "version-control"
coverImage: "railroad-through-the-forest-luxembourg.jpg"
---

When developing software, it's common to use a version control system. It's a great tool to help your team collaborate on development. Unfortunately, at some point in the course of developing your software, you will probably run into problems. When you do, version control is once again there to help you, this time by providing tools to review and undo past changes. Let's take a look at Git, a popular version control system, and some of the ways you can revert!

First of all, there are a couple of ways to undo something. We could rewrite our git history, or we could plow ahead and add new commits that undo the changes of previous commits. I tend to lean toward the latter because it's less destructive and keeps an accurate history of what happened. Of course, if they are just local commits, then go ahead and rewrite history if you'd like.

When you want to undo changes by way of a brand new commit, Git has a command called "revert."

```bash
gt revert <commit>
```

It's pretty simple. Just paste in the commit hash over <commit> and you are good to go. If you need to find the commit hash, there is a command to list out the commits:

```bash
git log
```

Of course, you may want to do more than just revert one commit. The revert command can also take a list of commits, so these are all valid as well:

```bash
# Revert 3 different commits
git revert <commit1> <commit2> <commit3>

# A range of commits
git revert <commit1>..<commit2>

# The last two commits
git revert HEAD~2..HEAD
```

Want to revert a merge?

```bash
git revert -m 1 <merge_commit>
```

Whoa! That one looks a little funny. Isn't -m for a message? In this case, the m stands for mainline and the value is a parent number. From the documentation:

> Usually you cannot revert a merge because you do not know which side of the merge should be considered the mainline. This option specifies the parent number (starting from 1) of the mainline and allows revert to reverse the change relative to the specified parent.
> 
> Reverting a merge commit declares that you will never want the tree changes brought in by the merge. As a result, later merges will only bring in tree changes introduced by commits that are not ancestors of the previously reverted merge. This may or may not be what you want.
> 
> [https://git-scm.com/docs/git-revert#\_options](https://git-scm.com/docs/git-revert#_options)

Since a merge has two parents, you need to specify which one is the mainline or trunk. Usually, parent 1 is the pre-merge commit and parent 2 is the tip of the branch that was merged in. You can see the parent commits listed in the git log.

```bash
commit c6c8afb6d5726d77d25e40b57e10435dd05d2ae3 (HEAD -> master)
Merge: ea23390 17a888c
Author: curtis
Date:   Fri Jun 5 18:25:49 2020 -0400

    Merge branch 'otherbranch'

commit ea23390aefa1512d2ec45276581977a8a9e0884c
Author: curtis
Date:   Fri Jun 5 18:25:35 2020 -0400

    More changes

commit 17a888c58c845d017a73448169b1838d56968702 (otherbranch)
Author: curtis
Date:   Fri Jun 5 18:25:06 2020 -0400

    Other changes
```

Notice the order of the two commits listed for "Merge."

Finally, take note from the documentation that if you want those changes back at a later time, you can't just merge that branch again. You can create a new branch and commit your changes, or you can revert the revert!

I hope this was helpful for those times when you need to undo a commit or a merge. Leave a comment below to let me know what you think. Or let me know how you approach undoing changes in your Git repository.
