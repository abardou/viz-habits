<template>
	<div />
</template>

<script>
import * as d3 from 'd3';

export default {
	name: 'SequenceLengthSlider',
	props: {
		range: {
			default: null
		}
	}, 
	data: () => {
		return {}
	},
	computed: {

	}, 
	mounted() {
		let that = this;
		this.sliderFill = d3
			.sliderBottom()
			.width(300)
			.min(d3.min(this.range))
			.max(d3.max(this.range))
			.tickFormat(d3.format('i'))
			.tickValues(this.range)
			.default(1)
			.step(1)
			.fill('#2196f3')
			.on('onchange', d => {
				that.sliderChanged(d);
			});

		var gFill = d3
			.select('body')
			.append('svg')
			.attr('width', 500)
			.attr('height', 100)
			.append('g')
			.attr('transform', 'translate(30,30)');

		gFill.call(this.sliderFill);

	},
	methods: {
		sliderChanged(d) {
			this.$store.commit('sequencelength', d);
		}
	}


};
/*
class SequenceLengthSlider {
            constructor(range, tools_ref) {
                this.range = range.filter(x => x < 30)
                this.tools_ref = tools_ref
            }




            draw() {
                this.sliderFill = d3
                    .sliderBottom()
                    .width(300)
                    .min(d3.min(this.range))
                    .max(d3.max(this.range))
                    .tickFormat(d3.format("i"))
                    .tickValues(this.range)
                    .default(1)
                    .step(1)
                    .fill('#2196f3')
                    .on('onchange', d => {
                      this.tools_ref.send_filters()
                    });

                var gFill = d3
                    .select('body')
                    .append('svg')
                    .attr('width', 500)
                    .attr('height', 100)
                    .append('g')
                    .attr('transform', 'translate(30,30)');

                gFill.call(this.sliderFill);

            }

            get_value() {
                return this.sliderFill.value()
            }

        }

*/
</script>
