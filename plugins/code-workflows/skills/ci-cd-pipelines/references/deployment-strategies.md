# Deployment Strategies

Common deployment patterns for production systems.

## Blue-Green Deployment

Two identical environments, only one active at a time.

### How It Works

1. **Blue** (current) serves production traffic
2. Deploy new version to **Green** (idle)
3. Test Green environment
4. Switch traffic from Blue to Green
5. Keep Blue as rollback option

### GitHub Actions Example

```yaml
jobs:
  deploy-green:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Green
        run: |
          railway up --environment green

      - name: Run Smoke Tests
        run: |
          curl -f https://green.example.com/health

      - name: Switch Traffic
        run: |
          # Update DNS or load balancer
          railway domain set green.example.com --environment green
```

### Pros and Cons

**Pros:**

- Zero downtime
- Instant rollback
- Full testing before switch

**Cons:**

- Double infrastructure cost
- Database migrations complex

## Canary Deployment

Gradual rollout to subset of users.

### How It Works

1. Deploy new version alongside current
2. Route small % of traffic to new version
3. Monitor metrics and errors
4. Gradually increase traffic
5. Full rollout or rollback

### Vercel Example

```yaml
jobs:
  canary:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Canary
        run: |
          vercel deploy --no-wait

      - name: Set Traffic Split
        run: |
          # 10% to canary
          vercel alias set $CANARY_URL example.com --scope team

  promote:
    needs: canary
    if: success()
    runs-on: ubuntu-latest
    steps:
      - name: Promote to Production
        run: |
          vercel promote $CANARY_URL --prod
```

### Pros and Cons

**Pros:**

- Low risk
- Real user feedback
- Gradual validation

**Cons:**

- Complex routing
- Multiple versions running
- Monitoring overhead

## Rolling Update

Replace instances one by one.

### How It Works

1. Take one instance out of rotation
2. Update the instance
3. Health check
4. Add back to rotation
5. Repeat for all instances

### Kubernetes Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

### GitHub Actions for K8s

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Set up kubectl
        uses: azure/setup-kubectl@v4

      - name: Deploy
        run: |
          kubectl set image deployment/app \
            app=${{ env.IMAGE_TAG }}
          kubectl rollout status deployment/app
```

### Pros and Cons

**Pros:**

- No extra infrastructure
- Gradual rollout
- Auto health checks

**Cons:**

- Slower deployment
- Multiple versions briefly
- Complex rollback

## Feature Flags

Deploy code, control activation separately.

### How It Works

1. Deploy code with feature behind flag
2. Feature disabled by default
3. Enable for specific users/percentage
4. Monitor and iterate
5. Remove flag when stable

### Implementation

```typescript
// With LaunchDarkly, Flagsmith, or custom
const showNewFeature = await featureFlags.isEnabled(
  'new-checkout',
  { userId: user.id }
);

if (showNewFeature) {
  return <NewCheckout />;
}
return <OldCheckout />;
```

### CI/CD Integration

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: pnpm deploy

      - name: Enable Feature (1%)
        run: |
          curl -X PATCH https://api.flagsmith.com/features/new-checkout \
            -H "Authorization: ${{ secrets.FLAGSMITH_KEY }}" \
            -d '{"percentage": 1}'
```

### Pros and Cons

**Pros:**

- Decouple deploy from release
- Instant enable/disable
- A/B testing built-in

**Cons:**

- Code complexity
- Technical debt (old flags)
- Testing combinations

## Recreate Deployment

Stop old version, start new version.

### How It Works

1. Stop all instances of current version
2. Deploy new version
3. Start new instances
4. Downtime during transition

### When to Use

- Development/staging environments
- Stateful applications
- Major version upgrades
- Database schema changes

### Example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Scale Down
        run: kubectl scale deployment/app --replicas=0

      - name: Run Migrations
        run: kubectl exec -it migration-job -- npm run migrate

      - name: Deploy New Version
        run: kubectl set image deployment/app app=$IMAGE_TAG

      - name: Scale Up
        run: kubectl scale deployment/app --replicas=3
```

### Pros and Cons

**Pros:**

- Simple
- Clean state
- No version conflicts

**Cons:**

- Downtime
- Not for production
- No gradual rollout

## Strategy Selection Guide

Choose based on your needs:

**Zero Downtime Required:**

- Blue-Green (instant switch)
- Rolling Update (gradual)
- Canary (controlled)

**Risk Mitigation:**

- Canary (monitor before full rollout)
- Feature Flags (instant rollback)
- Blue-Green (keep old version ready)

**Cost Sensitive:**

- Rolling Update (no extra infra)
- Feature Flags (no extra infra)

**Database Migrations:**

- Recreate (if downtime OK)
- Blue-Green (separate DBs)
- Feature Flags (backward compatible)

**A/B Testing:**

- Canary (traffic splitting)
- Feature Flags (user targeting)
