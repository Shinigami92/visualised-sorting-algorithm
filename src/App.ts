import Main from '@/components/Main.vue';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({ components: { Main } })
export default class App extends Vue {
  public drawer: boolean = true;
}
