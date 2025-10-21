<template>
  <div class="w-full h-full p-2 flex flex-col overflow-hidden">
    <div class="flex flex-wrap">
      <div
        class="bg-stone-800 h-20 w-full rounded-lg m-1 sm:(flex-1) p-2"
        @click="scrollToToday"
      >
        <div class="flex justify-between">
          <div class="text-white">{{ $t("Today") }}</div>
          <DynamicNumber
            :value="todayExpense"
            init
            class="text-white text-4xl font-bold"
          ></DynamicNumber>
        </div>
      </div>
    </div>
    <Ad/>
    <div v-if="list.length" class="flex-1 overflow-y-auto">
      <ListView
        ref="listView"
        :list="list"
        :get-range-height="getRangeHeight"
        :footer-height="400"
        value-key="id"
        class="main-bill-list mx-1"
      >
        <template #default="{ item, index }">
          <div>
            <div
              v-if="getDivideInfo(item, index)"
              class="divider flex justify-between items-center px-4 pt-6 pb-3 cursor-pointer"
              :class="[`divider-${index}`, { animated }]"
              @click="scrollToTop(index)"
            >
              <div class="ml-7 text-sm">{{ getDivideInfo(item, index) }}</div>
            </div>
            <BillItem
              :bill="(item as Bill)"
              :class="[
                `item-${index}`,
                { animated, 'to-remove': toBeRemovedId === item.id },
              ]"
              @click="show(item)"
            />
          </div>
        </template>
        <template #footer>
          <div class="h-24 px-4 mt-4">
            <div class="end flex items-center text-sm">{{ $t("ended") }}</div>
          </div>
        </template>
      </ListView>
    </div>
    <div
      v-else
      class="flex justify-center items-center text-sm text-gray-600 pt-20"
    >
      {{ $t("nothing-here-add-one-bill") }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { useBills } from "@/hooks/useBills";
import ListView from "@/components/common/List.vue";
import DynamicNumber from "@/components/common/DynamicNumber.vue";
import { useBillInfo } from "@/hooks/useBillInfo";
import dayjs from "dayjs";
import { BillType, type Bill } from "@/data/bill";
import BillItem from "../components/BillItem.vue";
import Ad from "../components/Ad.vue";
import { denseTime } from "@/utils/time";
import { add } from "mathjs";
const { list } = useBills();

const todayBills = computed(() =>
  list.value.filter(
    (x) =>
      x.time >= dayjs().startOf("day").unix() &&
      x.time <= dayjs().endOf("day").unix()
  )
);

const todayExpense = computed(() =>
  todayBills.value.reduce(
    (p, c) => add(p, (c.type === BillType.Expenses ? -1 : 1) * c.money),
    0
  )
);

const { show } = useBillInfo();

const getDivideInfo = (current: Readonly<Bill>, index: number) => {
  const last = list.value[index - 1];
  if (!last) {
    return denseTime(dayjs.unix(current.time));
  }
  const lastDate = dayjs.unix(last.time);
  const currentDate = dayjs.unix(current.time);
  if (!lastDate.isSame(currentDate, "days")) {
    return denseTime(currentDate);
  }
  return;
};

const getRangeHeight = (start: number, length: number) => {
  let dividerCount = 0;
  const end = Math.min(list.value.length, start + length);
  for (let index = start; index < end; index += 1) {
    const current = list.value[index];
    const last = list.value[index - 1];
    if (
      !last ||
      !dayjs.unix(last.time).isSame(dayjs.unix(current.time), "days")
    ) {
      dividerCount += 1;
    }
  }
  const dividerH = 56; // 2.5rem
  const itemH = 72; // 4.5rem
  const itemCount = end - start;
  return dividerH * dividerCount + itemH * itemCount;
};

const getItemScrollTop = (index: number) => getRangeHeight(0, index);
const listView = ref<InstanceType<typeof ListView>>();
const scrollToToday = () => {
  const index = list.value.findIndex((bill) =>
    dayjs.unix(bill.time).isSame(dayjs(), "date")
  );
  listView.value?.scrollTo(getItemScrollTop(index));
};

const animated = ref(false);
onMounted(() => {
  setTimeout(() => {
    animated.value = true;
  }, 1000);
});

const scrollToTop = (index: number) => {
  document
    .querySelector(`.divider-${index}`)
    ?.scrollIntoView({ behavior: "smooth" });
};

const toBeRemovedId = ref("");
// const removeItem = (id: string) => {
//   toBeRemovedId.value = id;
//   setTimeout(() => {
//     remove(id);
//   }, 500);
// };
</script>
<style lang="scss" scoped>
.main-bill-list {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    width: 1px;
    height: calc(100% - 4rem - 310px);
    background-color: black;
    top: 0;
    left: 2.1rem;
    z-index: -2;
    animation: fade 2s ease-in-out;
  }

  .end {
    animation: fade 1.5s ease-in-out;
  }

  .end::before {
    content: "";
    z-index: -1;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    border: 1px solid black;
    background-color: white;
    bottom: 0;
    margin: 0 0.8rem;
  }

  .animated:not(.to-remove) {
    animation: none !important;
    opacity: 1 !important;
  }

  .to-remove {
    animation: remove 0.5s ease !important;
  }

  .bill-item {
    @for $i from 0 through 10 {
      &.item-#{$i} {
        opacity: 0;
        animation: fly 0.5s ease-in-out $i * 0.05s forwards;
      }
    }
  }

  .divider {
    @for $i from 0 through 10 {
      &.divider-#{$i} {
        animation: fade 1.5s ease-in-out;
      }
    }
  }

  @keyframes fly {
    from {
      opacity: 0;
      transform: translateY(50vh);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes remove {
    from {
      opacity: 1;
      transform: translateX(0);
    }

    to {
      opacity: 0;
      transform: translateX(10%);
    }
  }

  // .list-enter-active,
  // .list-leave-active {
  //   .bill-item{
  //     transition: all 20s ease;
  //   }
  // }

  // .list-enter-from,
  // .list-leave-to {
  //   .bill-item{
  //     opacity: 0;
  //     transform: translateX(30px);
  //   }
  // }

  // /* 确保将离开的元素从布局流中删除
  //   以便能够正确地计算移动的动画。 */
  // .list-leave-active {
  //   .bill-item{
  //     position: absolute;
  //   }
  // }
}
</style>
