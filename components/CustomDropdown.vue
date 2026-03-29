<template>
  <div class="custom-dropdown" :class="{ 'is-open': isOpen }" v-click-outside="close">
    <button type="button" class="custom-dropdown__trigger" @click="toggle">
      <span class="custom-dropdown__label">{{ selectedLabel }}</span>
      <i class="custom-dropdown__arrow ri-arrow-down-s-line"></i>
    </button>
    <ul class="custom-dropdown__menu" v-if="isOpen">
      <li
        v-for="option in options"
        :key="option.value"
        class="custom-dropdown__item"
        :class="{ 'is-selected': option.value === value }"
        @click="select(option)"
      >
        <i v-if="option.value === value" class="ri-check-line custom-dropdown__check"></i>
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CustomDropdown',
  props: {
    value: {
      type: String,
      required: true,
    },
    options: {
      type: Array as () => Array<{ label: string; value: string }>,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Select…',
    },
  },
  data() {
    return {
      isOpen: false,
    }
  },
  computed: {
    selectedLabel(): string {
      const match = (this.options as Array<{ label: string; value: string }>).find(
        (o) => o.value === this.value
      )
      return match ? match.label : this.placeholder
    },
  },
  directives: {
    'click-outside': {
      bind(el: any, binding: any) {
        el._clickOutsideHandler = (event: Event) => {
          if (!el.contains(event.target as Node)) {
            binding.value()
          }
        }
        document.addEventListener('click', el._clickOutsideHandler)
      },
      unbind(el: any) {
        document.removeEventListener('click', el._clickOutsideHandler)
      },
    },
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    },
    close() {
      this.isOpen = false
    },
    select(option: { label: string; value: string }) {
      this.$emit('input', option.value)
      this.isOpen = false
    },
  },
})
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  display: block;
  width: 100%;
  user-select: none;
}

.custom-dropdown__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #fff;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.custom-dropdown.is-open .custom-dropdown__trigger {
  border-color: #6c757d;
  box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.15);
}

.custom-dropdown__trigger:hover {
  border-color: #adb5bd;
}

.custom-dropdown__arrow {
  font-size: 1.1rem;
  color: #6c757d;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.custom-dropdown.is-open .custom-dropdown__arrow {
  transform: rotate(180deg);
}

.custom-dropdown__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 200;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  animation: dropdownReveal 0.12s ease-out;
}

@keyframes dropdownReveal {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.custom-dropdown__item {
  padding: 9px 14px 9px 36px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #333;
  position: relative;
  transition: background 0.1s;
  border-radius: 4px;
  margin: 0 4px;
}

.custom-dropdown__item:hover {
  background: #f1f3f5;
}

.custom-dropdown__item.is-selected {
  color: #212529;
  font-weight: 600;
  background: #e9ecef;
}

.custom-dropdown__check {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: #495057;
}
</style>
