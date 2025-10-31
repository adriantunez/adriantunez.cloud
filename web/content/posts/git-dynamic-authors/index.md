---
title: Git dynamic authors
summary: "A dynamic Git configuration that automatically sets the author name and email based on the repository path. It's perfect for working on multiple projects from a single laptop safely without manual switching."
categories: [Code, Security]
tags: [Git]
date: 2025-05-10
---

## Introduction

When working with repositories from multiple companies, as well as personal projects, it's important to ensure that each commit uses the correct Git author name and email. Manually updating your Git configuration every time you switch projects can be tedious and error-prone. In this post, we'll explore how to automate Git author configuration based on the repository you're working in.

## My Git repositories structure

I like to have all repositories structured inside a single top-level folder called `software`. Inside this folder, I separate company-related and personal projects into two subfolders: `companyname` and `personal`, respectively.
This structure helps me easily distinguish between different types of projects. The layout looks like this:

{{< highlight text >}}
~/software
├── companyname
│ ├── repo1
│ ├── org1
│ | ├── repo2
│ | └── ...
│ └── ...
└── personal
├── repoA
├── repoB
└── ...
{{< /highlight >}}

For company repositories, instead of using a flat, I prefer to mirror the [GitHub Organizations](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations) model. In the example above, `repo2` belongs to the `org1` organization, reflecting its logical grouping. However, some repositories like `repo1` may remain at the top level if they aren't tied to a specific organization.

## Git dynamic author configuration

You can create or override the Git configuration file in your home directory (`~/.gitconfig`) with the following contents:

{{< highlight toml >}}

# ~/.gitconfig

[includeIf "gitdir:~/software/companyname/"]
path = .gitconfig-companyname
[includeIf "gitdir:~/software/personal/"]
path = .gitconfig-personal
{{< /highlight >}}

{{< alert >}}
_Note:_ The `includeIf` directive path must end with a `/`.
{{< /alert >}}

Then, create as many configuration files as needed. In this example, we'll create one for company (`companyname`) repositories and another one for personal (`personal`) uses:

{{< highlight toml >}}

# ~/.gitconfig-companyname

[user]
name = "Adri Antunez"
email = "employee@company.com"
{{< /highlight >}}

{{< highlight toml >}}

# ~/.gitconfig-personal

[user]
name = "Adri Antunez"
email = "user@youremail.com"
{{< /highlight >}}

{{< alert "lightbulb" >}}
_Tip:_ You might not want to expose your personal email address in public Git commits. See the [hidding your email]({{% relref "#hidding-your-email" %}}) section for more information.
{{< /alert >}}

## Verify it works

Once everything is set up, navigate into any _repository_ and run the following commands to verify that Git picks the correct user configuration:

{{< highlight bash >}}
cd ~/software/companyname/repo1
git config user.name
git config user.email
{{< /highlight >}}

Based on the example above, you should see the values from `~/.gitconfig-companyname`, such as the username (`Adri Antunez`) and the email (`employee@company.com`).

## Additional pro tips

### Set a default global configuration

If you prefer, you can set a default fallback configuration and override it only when needed, you can define a default at the top and use the `includeIf` directive afterward:

{{< highlight toml "hl_lines=2-4" >}}

# ~/.gitconfig

[user]
name = "Adri Antunez"
email = "employee@company.com"
[includeIf "gitdir:~/software/personal/"]
path = .gitconfig-personal
{{< /highlight >}}

{{< alert >}}
_Note:_ Place the `includeIf` directive at the end of the file to ensure global values are correctly overriden.
{{< /alert >}}

### Hidding your email

For company work, using your company email is generally acceptable. However, for personal projects, you might want to hide your real email address. Git providers like GitHub allow you to use a no-reply email. To enable this:

1. Go to your `GitHub account` → `Settings` → `Emails`.
1. Enable `Keep my email addresses private`.
1. Use the provided [no-reply address](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address#about-no-reply-email) in your configuration (`xxxx@users.noreply.github.com`).

The configuration file should be something similar to:

{{< highlight toml >}}

# ~/.gitignore-personal

[user]
name = "Adri Antunez"
email = "xxxx+adriantunez@users.noreply.github.com"
{{< /highlight >}}

### Signing your commits

In some sensitive environments, you might also want to sign your own commits (and tags) to prove authorship. There is a detailed [{{<icon "check">}} Git Signed Commits]({{% relref "/posts/git-signed-commits" %}}) blog post about it, but long story short:

{{< highlight toml >}}
[user]

# ~/.gitconfig-companyname

...
signingkey = A54A1BF56E30CE3E # sign commits with your GPG key
[commit]
gpgsign = true
[tag]
gpgsign = true
{{< /highlight >}}

### Use different SSH keys

You can use different SSH keys for different usecases too:

{{< highlight toml >}}

# ~/.gitconfig-companyname

...
[core]
sshCommand = ssh -i ~/.ssh/company/id_ed25519
{{< /highlight >}}

{{< highlight toml >}}

# ~/.gitconfig-personal

...
[core]
sshCommand = ssh -i ~/.ssh/own/id_rsa
{{< /highlight >}}

### Setup remote branch automatically

When you're creating a new branch, say `feature/my-awesome-feature`, you need to set the upstream manually:

{{< highlight toml >}}
git checkout -b feature/my-awesome-feature # create new branch
git push --set-upstream origin feature/my-awesome-feature # type this once
...
git push # now for this branch, you can use git push directly

{{< /highlight >}}

Or even worse, if you don't set the upstream, you need to type the remote branch on every push:

{{< highlight toml >}}
git checkout -b feature/my-awesome-feature # create new branch
...
git push origin feature/my-awesome-feature # type the origin <remote-branch> on every push
{{< /highlight >}}

Instead, you can set `autoSetupRemote` flag to `true`. With the `autoSetupRemote` config, you don't need to type manually the remote branch name, even once, for any repository falling within your gitconfig, so you can push the changes simply with `git push`.

{{< highlight toml >}}

# ~/.gitconfig-companyname

[push]
autoSetupRemote = true
{{< /highlight >}}

## Conclusions

This setup allows you to define Git identities based on folder paths. However, it's generally discouraged to mix personal and work repositories on the same device. Use this approach at your own risk. That said, it's particularly useful for freelancers or consultants working with multiple clients simultaneously. In addition, we've seen different git configs that can empower security, privacy and productivity.
