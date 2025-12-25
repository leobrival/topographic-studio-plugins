# Infrastructure as Code for GitHub Rules

Manage GitHub repository rules using IaC tools.

## Terraform

### Provider Setup

```hcl
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

variable "github_token" {
  type      = string
  sensitive = true
}

variable "github_owner" {
  type = string
}
```

### Branch Protection

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.repo.node_id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = ["ci"]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
    required_approving_review_count = 1
    require_last_push_approval      = true
  }

  enforce_admins = false

  restrict_pushes {
    blocks_creations = true
  }

  allows_deletions    = false
  allows_force_pushes = false

  require_conversation_resolution = true
  required_linear_history         = true
}
```

### Repository Ruleset

```hcl
resource "github_repository_ruleset" "main_protection" {
  name        = "Protect main branch"
  repository  = github_repository.repo.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  rules {
    pull_request {
      required_approving_review_count   = 1
      dismiss_stale_reviews_on_push     = true
      require_code_owner_review         = true
      require_last_push_approval        = true
      required_review_thread_resolution = true
    }

    required_status_checks {
      required_check {
        context = "ci"
      }
      strict_required_status_checks_policy = true
    }

    required_linear_history = true
    non_fast_forward        = true
    deletion                = true
  }

  bypass_actors {
    actor_id    = data.github_team.admins.id
    actor_type  = "Team"
    bypass_mode = "pull_request"
  }
}
```

### Organization Ruleset

```hcl
resource "github_organization_ruleset" "default_protection" {
  name        = "Default branch protection"
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
    repository_name {
      include = ["~ALL"]
      exclude = ["test-*", "sandbox-*"]
    }
  }

  rules {
    pull_request {
      required_approving_review_count = 1
      dismiss_stale_reviews_on_push   = true
    }

    required_status_checks {
      required_check {
        context = "ci"
      }
    }
  }
}
```

## Pulumi

### TypeScript Setup

```typescript
import * as github from "@pulumi/github";

const repo = new github.Repository("my-repo", {
  name: "my-repo",
  visibility: "private",
});

const mainProtection = new github.BranchProtection("main-protection", {
  repositoryId: repo.nodeId,
  pattern: "main",
  enforceAdmins: false,
  requiredStatusChecks: [{
    strict: true,
    contexts: ["ci"],
  }],
  requiredPullRequestReviews: [{
    dismissStaleReviews: true,
    requireCodeOwnerReviews: true,
    requiredApprovingReviewCount: 1,
    requireLastPushApproval: true,
  }],
  allowsDeletions: false,
  allowsForcePushes: false,
  requireConversationResolution: true,
  requiredLinearHistory: true,
});
```

### Ruleset

```typescript
const ruleset = new github.RepositoryRuleset("main-ruleset", {
  name: "Protect main",
  repository: repo.name,
  target: "branch",
  enforcement: "active",
  conditions: {
    refName: {
      includes: ["~DEFAULT_BRANCH"],
      excludes: [],
    },
  },
  rules: {
    pullRequest: {
      requiredApprovingReviewCount: 1,
      dismissStaleReviewsOnPush: true,
      requireCodeOwnerReview: true,
    },
    requiredStatusChecks: {
      requiredChecks: [{
        context: "ci",
      }],
      strictRequiredStatusChecksPolicy: true,
    },
    requiredLinearHistory: true,
    nonFastForward: true,
  },
});
```

## GitHub CLI Script

For simpler automation without full IaC:

```bash
#!/bin/bash
# apply-rules.sh

OWNER="$1"
REPO="$2"

# Apply standard ruleset
gh api "repos/$OWNER/$REPO/rulesets" \
  --method POST \
  --input rulesets/standard-team.json

echo "Rules applied to $OWNER/$REPO"
```

### Batch Apply to Multiple Repos

```bash
#!/bin/bash
# apply-to-all-repos.sh

REPOS=$(gh repo list --json name -q '.[].name')

for repo in $REPOS; do
  echo "Applying rules to $repo..."
  ./apply-rules.sh myorg "$repo"
done
```

## GitHub Actions for Rule Management

```yaml
name: Sync Repository Rules

on:
  push:
    paths:
      - 'rulesets/**'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Apply Rulesets
        env:
          GH_TOKEN: ${{ secrets.ADMIN_TOKEN }}
        run: |
          for ruleset in rulesets/*.json; do
            name=$(jq -r '.name' "$ruleset")
            echo "Applying $name..."

            # Check if exists
            existing=$(gh api repos/${{ github.repository }}/rulesets \
              --jq ".[] | select(.name == \"$name\") | .id")

            if [ -n "$existing" ]; then
              gh api "repos/${{ github.repository }}/rulesets/$existing" \
                --method PUT --input "$ruleset"
            else
              gh api "repos/${{ github.repository }}/rulesets" \
                --method POST --input "$ruleset"
            fi
          done
```

## Best Practices

1. **Version control rules**: Store in Git
2. **Use IaC for org-wide**: Terraform/Pulumi for consistency
3. **Test in sandbox**: Apply to test repo first
4. **Audit changes**: Track who changed what
5. **Document exceptions**: Why bypass exists
