# usage-bars

Shows two always-on progress bars above the prompt in every chat: one for the session (five-hour) usage limit and one for the weekly (seven-day) limit, each with the percent used and when it resets. Bars turn yellow at 70% and red at 90%. Figures come from the rate-limit windows the session already reports, so the bars fill in after the first response and update when a window moves a whole point. Off a subscription plan, no figures are reported and the bars say they are waiting.

## Install

At the prompt of a terminal session:

```
/plugin install usage-bars --marketplace rizzopetert-coder/usage-bars
```

From a shell:

```
claude plugin install usage-bars --marketplace rizzopetert-coder/usage-bars
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `rizzopetert-coder/usage-bars`, then Add plugin.
