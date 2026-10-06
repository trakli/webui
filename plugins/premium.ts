import ExtensionCard from '~/components/premium/ExtensionCard.vue';
export default defineNuxtPlugin(() => {
  const { registerComponent } = useExtensionSlots();
  registerComponent('premium.billing', ExtensionCard);
  registerComponent('premium.banks', ExtensionCard);
});
