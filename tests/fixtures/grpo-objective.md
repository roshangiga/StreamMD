\[
\mathcal{J}_{\text{GRPO}}(\theta)=
\mathbb{E}_{q\sim P(Q),\,\{o_i\}_{i=1}^{G}\sim\pi_{\theta_{\text{old}}}(\cdot\mid q)}
\left[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\left(
\min\left(
\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t}\mid q,o_{i,<t})}A_{i,t},\;
\operatorname{clip}\!\left(
\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\text{old}}}(o_{i,t}\mid q,o_{i,<t})},\;1-\epsilon,\;1+\epsilon
\right)A_{i,t}
\right)
-
\beta\,\mathbb{D}_{\text{KL}}\big[\pi_\theta\parallel\pi_{\text{ref}}\big]
\right)
\right].
\]