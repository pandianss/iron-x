# Canonical Metric Definitions

**Version:** 1.0.0
**Status:** DRAFT

## 1. Overview
This document defines the mathematical properties of the standard metrics used in Operational Discipline Systems. These metrics are implementation-agnostic and serve as the basis for interoperability.

## 2. Core Metrics

### 2.1. Discipline Score ($D$)
The primary aggregate measure of an entity's reliability.

**Formula:**
$$ D = \frac{\sum_{i=1}^{n} (w_i \cdot c_i)}{\sum_{i=1}^{n} w_i} $$

Where:
- $n$: Total number of closed Intents in the window.
- $w_i$: Weight of the $i$-th Intent (default 1.0).
- $c_i$: Compliance value (1 for Success, 0 for Failure).

**Range:** $0.0$ to $1.0$
**Interpretation:**
- $> 0.9$: High Reliability (Sovereign)
- $0.7 - 0.9$: Operational (Standard)
- $< 0.7$: At Risk (Needs Intervention)
- $< 0.5$: System Failure (Lockout recommended)

### 2.2. Execution Rate ($XR$)
The raw percentage of Intents that result in Actions, regardless of timing.

**Formula:**
$$ XR = \frac{N_{executed}}{N_{total}} $$

**Range:** $0.0$ to $1.0$ (0% to 100%)

### 2.3. On-Time Rate ($OTR$)
The percentage of Actions executed *before* or *at* $t_{due}$.

**Formula:**
$$ OTR = \frac{N_{on-time}}{N_{executed}} $$

**Note:** This is a subset of executed tasks. A task that is not done is effectively $L = \infty$, but for OTR, we typically exclude missed tasks or count them as 0 depending on strictness. *Canonical Standard:* Count missed tasks as infinite delay, effectively 0 OTR contribution.

## 3. Advanced Metrics

### 3.1. Execution Lag ($L$)
The time delta between valid start and actual execution.

**Formula:**
$$ L = t_{exec} - t_{start} $$

**Unit:** Seconds (or scaled to Hours/Days)

### 3.2. Habit Strength ($H$)
A measure of the variance in execution time ($L$) for a recurring Intent. Lower variance implies stronger habit formation.

**Formula (Inverse Variance):**
$$ H = \frac{1}{1 + \sigma^2_L} $$

Where $\sigma^2_L$ is the variance of the Lag over the last $k$ occurrences.

**Range:** $0.0$ (Random) to $1.0$ (Perfectly Periodic).

### 3.3. Outcome Confidence ($C$)
The probability that a specific Discipline Score $D$ yields a desired Outcome $O$.

**Formula:**
$$ C(O|D) = P(O \text{ achieved} | \text{Discipline} \ge D) $$

Derived from historical population data.

## 4. Misuse Warnings
1.  **Do not use for Compensation:** $D$ measures *process reliability*, not *value creation*. High discipline on useless tasks is still useless.
2.  **Context Matters:** Comparing $D$ across different role types (e.g. Sales vs. Engineering) requires normalization.
3.  **Gaming:** If $w_i$ (weight) is user-settable, users may inflate $D$ with trivial tasks. *Recommendation:* Fix $w_i$ by policy.
