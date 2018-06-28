'use strict';
/*!
 * @version: 1.1.1
 * @name: map
 *
 * @author: https://themeforest.net/user/flexlayers
 */

import 'raphael';
import 'jquery-mapael';
import 'jquery-mapael/js/maps/world_countries';

$(function () {

    // Plots params
    let plots: any = {
        'paris': {
            'latitude': 48.86, 'longitude': 2.3444,
            'text': {'position': 'left', content: 'Paris'}, href: ''
        },
        'newyork': {
            'latitude': 40.667, 'longitude': -73.833,
            'text': {content: 'New york'}, href: ''
        },
        'sydney': {
            'latitude': -33.917, 'longitude': 151.167,
            'text': {content: 'Sydney'}, href: ''
        },
        'brasilia': {
            'latitude': -15.781682, 'longitude': -47.924195,
            'text': {content: 'Brasilia'}, href: ''
        },
        'tokyo': {
            'latitude': 35.687418, 'longitude': 139.692306,
            'text': {content: 'Tokyo'}, href: ''
        }
    };

    // Mapael initialisation
    let $world = $('.world-map');
    $world.find('.hamburger-btn').click(function () {
        $world.find('.search-results').transition();
    });
    $world.mapael({
        map: {
            name: 'world_countries',
            defaultArea: {
                attrs: {fill: '#f4fafc', stroke: '#797d81', 'stroke-width': 0.3},
                attrsHover: {fill: '#e19941'}
            },
            defaultPlot: {
                text: {
                    attrs: {fill: '#797d81', 'font-size': 12, 'font-family': 'Open Sans',},
                    attrsHover: {fill: '#f4fafc', 'font-weight': 'bold'}
                }
            },
            zoom: {
                enabled: true, maxLevel: 10, mousewheel: false, buttons: {
                    in: {cssClass: 'btn-sm-icon btn btn-default zoomIn zoomButton'},
                    out: {cssClass: 'btn-sm-icon btn btn-default zoomOut zoomButton'},
                    reset: {
                        cssClass: 'btn-sm-icon btn btn-default zoomReset zoomButton',
                        content: '<i class="fa fa-crosshairs"></i>'
                    }
                }
            },
            afterInit: function () {
                $world.find('.hamburger-btn').click(function () {
                });

                $world.find('.item').on('click', 'a', function () {
                    let plot = $(this).data('href');
                    if (plots[plot]) {
                        $world.trigger('zoom', {
                            level: 10,
                            latitude: plots[plot].latitude,
                            longitude: plots[plot].longitude
                        });
                    }
                });
            }
        },
        legend: {
            area: {
                display: true, marginBottom: 14, marginLeft: 0,
                titleAttrs: {
                    'font-size': 16,
                    'font-family': 'Open Sans',
                    y: 200
                },
                slices: [
                    {
                        max: 5000000,
                        attrs: {fill: '#5b667f'},
                        label: 'Less than 5M'
                    },
                    {
                        min: 5000000, max: 10000000,
                        attrs: {fill: '#42495c'},
                        label: 'Between 5M and 10M'
                    },
                    {
                        min: 10000000, max: 50000000,
                        attrs: {fill: '#353b4a'},
                        label: 'Between 10M and 50M'
                    },
                    {
                        min: 50000000,
                        attrs: {fill: '#0f1015'},
                        label: 'More than 50M'
                    }
                ]
            },
            plot: {
                display: true, marginBottom: 14, marginLeft: 0,
                slices: [
                    {
                        type: 'circle',
                        max: 500000,
                        attrs: {fill: '#71bb54', 'stroke-width': 0},
                        attrsHover: {transform: 's1.5', 'stroke-width': 0},
                        label: 'Less than 500 000',
                        size: 10
                    },
                    {
                        type: 'circle',
                        min: 500000, max: 1000000,
                        attrs: {fill: '#71bb54', 'stroke-width': 0},
                        attrsHover: {transform: 's1.5', 'stroke-width': 0},
                        label: 'Between 500 000 and 1M',
                        size: 18
                    },
                    {
                        type: 'circle',
                        min: 1000000,
                        attrs: {fill: '#71bb54', 'stroke-width': 0},
                        attrsHover: {transform: 's1.5', 'stroke-width': 0},
                        label: 'More than 1M',
                        size: 25
                    }
                ]
            }
        },
        plots: $.extend(true, {}, {
            'paris': {
                value: 382495,
                tooltip: {content: '<span>Paris</span><br />Sales: $ 382400'}
            },
            'newyork': {
                value: 881903,
                tooltip: {content: '<span>New-York</span><br />Sales: $ 881900'}
            },
            'sydney': {
                value: 695496,
                tooltip: {content: '<span>Sydney</span><br />Sales: $ 695400'}
            },
            'brasilia': {
                value: 392706,
                tooltip: {content: '<span>Brasilia</span><br />Sales: $ 392700'}
            },
            'tokyo': {
                value: 1491797,
                tooltip: {content: '<span>Tokyo</span><br />Sales: $ 1491700'}
            }
        }, plots),
        areas: {
            'AF': {
                value: 5246680, href: '',
                tooltip: {content: '<span>Afghanistan</span><br />Sales: $ 52466800'}
            },
            'ZA': {
                value: 2608826, href: '',
                tooltip: {content: '<span>South Africa</span><br />Sales: $ 26108800'}
            },
            'AL': {
                value: 535599460, href: '',
                tooltip: {content: '<span>Albania</span><br />Sales: $ 53559900'}
            },
            'DZ': {
                value: 49796088, href: '',
                tooltip: {content: '<span>Algeria</span><br />Sales: $ 49796000'}
            },
            'DE': {
                value: 76718374, href: '',
                tooltip: {content: '<span>Germany</span><br />Sales: $ 16718300'}
            },
            'AD': {
                value: 26774219, href: '',
                tooltip: {content: '<span>Andorra</span><br />Sales: $ 26774200'}
            },
            'AO': {
                value: 54956540, href: '',
                tooltip: {content: '<span>Angola</span><br />Sales: $ 54956500'}
            },
            'AG': {
                value: 56018610, href: '',
                tooltip: {content: '<span>Antigua And Barbuda</span><br />Sales: $ 56018600'}
            },
            'SA': {
                value: 54792020, href: '',
                tooltip: {content: '<span>Saudi Arabia</span><br />Sales: $ 54792000'}
            },
            'AR': {
                value: 47445276, href: '',
                tooltip: {content: '<span>Argentina</span><br />Sales: $ 47445200'}
            },
            'AM': {
                value: 20670517, href: '',
                tooltip: {content: '<span>Armenia</span><br />Sales: $ 20670500'}
            },
            'AU': {
                value: 6435858, href: '',
                tooltip: {content: '<span>Australia</span><br />Sales: $ 6435800'}
            },
            'AT': {
                value: 59990860, href: '',
                tooltip: {content: '<span>Austria</span><br />Sales: $ 59990800'}
            },
            'AZ': {
                value: 18862622, href: '',
                tooltip: {content: '<span>Azerbaijan</span><br />Sales: $ 18862600'}
            },
            'BS': {
                value: 8730001, href: '',
                tooltip: {content: '<span>Bahamas</span><br />Sales: $ 8730000'}
            },
            'BH': {
                value: 56413459, href: '',
                tooltip: {content: '<span>Bahrain</span><br />Sales: $ 56413400'}
            },
            'BD': {
                value: 15468020, href: '',
                tooltip: {content: '<span>Bangladesh</span><br />Sales: $ 15468000'}
            },
            'BB': {
                value: 21516882, href: '',
                tooltip: {content: '<span>Barbados</span><br />Sales: $ 21516800'}
            },
            'BE': {
                value: 47213120, href: '',
                tooltip: {content: '<span>Belgium</span><br />Sales: $ 47213100'}
            },
            'BZ': {
                value: 31867035, href: '',
                tooltip: {content: '<span>Belize</span><br />Sales: $ 31867000'}
            },
            'BJ': {
                value: 54126627, href: '',
                tooltip: {content: '<span>Benin</span><br />Sales: $ 54126600'}
            },
            'BT': {
                value: 46048682, href: '',
                tooltip: {content: '<span>Bhutan</span><br />Sales: $ 46048600'}
            },
            'BY': {
                value: 14447995, href: '',
                tooltip: {content: '<span>Belarus</span><br />Sales: $ 14447900'}
            },
            'MM': {
                value: 28262213, href: '',
                tooltip: {content: '<span>Myanmar</span><br />Sales: $ 28262200'}
            },
            'BO': {
                value: 39319803, href: '',
                tooltip: {content: '<span>Bolivia, Plurinational State Of</span><br />Sales: $ 39319800'}
            },
            'BA': {
                value: 53148645, href: '',
                tooltip: {content: '<span>Bosnia And Herzegovina</span><br />Sales: $ 53148600'}
            },
            'BW': {
                value: 58312754, href: '',
                tooltip: {content: '<span>Botswana</span><br />Sales: $ 58312700'}
            },
            'BR': {
                value: 51214618, href: '',
                tooltip: {content: '<span>Brazil</span><br />Sales: $ 51214600'}
            },
            'BN': {
                value: 44050675, href: '',
                tooltip: {content: '<span>Brunei Darussalam</span><br />Sales: $ 44050600'}
            },
            'BG': {
                value: 33457398, href: '',
                tooltip: {content: '<span>Bulgaria</span><br />Sales: $ 33457300'}
            },
            'BF': {
                value: 57135520, href: '',
                tooltip: {content: '<span>Burkina Faso</span><br />Sales: $ 57135500'}
            },
            'BI': {
                value: 16489874, href: '',
                tooltip: {content: '<span>Burundi</span><br />Sales: $ 16489800'}
            },
            'KH': {
                value: 51472367, href: '',
                tooltip: {content: '<span>Cambodia</span><br />Sales: $ 51472300'}
            },
            'CM': {
                value: 7565564, href: '',
                tooltip: {content: '<span>Cameroon</span><br />Sales: $ 7565500'}
            },
            'CA': {
                value: 38994418, href: '',
                tooltip: {content: '<span>Canada</span><br />Sales: $ 38994400'}
            },
            'CV': {
                value: 49503608, href: '',
                tooltip: {content: '<span>Cape Verde</span><br />Sales: $ 49503600'}
            },
            'CF': {
                value: 14788003, href: '',
                tooltip: {content: '<span>Central African Republic</span><br />Sales: $ 14788000'}
            },
            'CL': {
                value: 26013769, href: '',
                tooltip: {content: '<span>Chile</span><br />Sales: $ 26013700'}
            },
            'CN': {
                value: 2017575, href: '',
                tooltip: {content: '<span>China</span><br />Sales: $ 2017500'}
            },
            'CY': {
                value: 6121441, href: '',
                tooltip: {content: '<span>Cyprus</span><br />Sales: $ 6121400'}
            },
            'CO': {
                value: 36950711, href: '',
                tooltip: {content: '<span>Colombia</span><br />Sales: $ 36950700'}
            },
            'KM': {
                value: 49492639, href: '',
                tooltip: {content: '<span>Comoros</span><br />Sales: $ 49492600'}
            },
            'CG': {
                value: 34183115, href: '',
                tooltip: {content: '<span>Congo</span><br />Sales: $ 34183100'}
            },
            'CD': {
                value: 11759002, href: '',
                tooltip: {content: '<span>Congo, The Democratic Republic Of The</span><br />Sales: $ 11759000'}
            },
            'KP': {
                value: 11263614, href: '',
                tooltip: {content: '<span>Korea, Democratic People\'s Republic Of</span><br />Sales: $ 11263600'}
            },
            'KR': {
                value: 8742797, href: '',
                tooltip: {content: '<span>Korea, Republic Of</span><br />Sales: $ 8742700'}
            },
            'CR': {
                value: 13819162, href: '',
                tooltip: {content: '<span>Costa Rica</span><br />Sales: $ 13819100'}
            },
            'CI': {
                value: 42081915, href: '',
                tooltip: {content: '<span>C\u00d4te D\'ivoire</span><br />Sales: $ 42081900'}
            },
            'HR': {
                value: 40679837, href: '',
                tooltip: {content: '<span>Croatia</span><br />Sales: $ 40679800'}
            },
            'CU': {
                value: 44154871, href: '',
                tooltip: {content: '<span>Cuba</span><br />Sales: $ 44154800'}
            },
            'DK': {
                value: 28903842, href: '',
                tooltip: {content: '<span>Denmark</span><br />Sales: $ 28903800'}
            },
            'DJ': {
                value: 42805805, href: '',
                tooltip: {content: '<span>Djibouti</span><br />Sales: $ 42805800'}
            },
            'DM': {
                value: 18502505, href: '',
                tooltip: {content: '<span>Dominica</span><br />Sales: $ 18502500'}
            },
            'EG': {
                value: 26569482, href: '',
                tooltip: {content: '<span>Egypt</span><br />Sales: $ 26569400'}
            },
            'AE': {
                value: 17665280, href: '',
                tooltip: {content: '<span>United Arab Emirates</span><br />Sales: $ 17665200'}
            },
            'EC': {
                value: 49496295, href: '',
                tooltip: {content: '<span>Ecuador</span><br />Sales: $ 49496200'}
            },
            'ER': {
                value: 47684745, href: '',
                tooltip: {content: '<span>Eritrea</span><br />Sales: $ 47684700'}
            },
            'ES': {
                value: 36477258, href: '',
                tooltip: {content: '<span>Spain</span><br />Sales: $ 36477200'}
            },
            'EE': {
                value: 8181601, href: '',
                tooltip: {content: '<span>Estonia</span><br />Sales: $ 8181600'}
            },
            'US': {
                value: 7869012, href: '',
                tooltip: {content: '<span>United States</span><br />Sales: $ 7869000'}
            },
            'ET': {
                value: 21529678, href: '',
                tooltip: {content: '<span>Ethiopia</span><br />Sales: $ 21529600'}
            },
            'FJ': {
                value: 4618823, href: '',
                tooltip: {content: '<span>Fiji</span><br />Sales: $ 4618800'}
            },
            'FI': {
                value: 58480930, href: '',
                tooltip: {content: '<span>Finland</span><br />Sales: $ 58480900'}
            },
            'FR': {
                value: 13389581, href: '',
                tooltip: {content: '<span>France</span><br />Sales: $ 13389500'}
            },
            'GA': {
                value: 42990433, href: '',
                tooltip: {content: '<span>Gabon</span><br />Sales: $ 42990400'}
            },
            'GM': {
                value: 11484802, href: '',
                tooltip: {content: '<span>Gambia</span><br />Sales: $ 11484800'}
            },
            'GE': {
                value: 16941391, href: '',
                tooltip: {content: '<span>Georgia</span><br />Sales: $ 16941300'}
            },
            'GH': {
                value: 11773626, href: '',
                tooltip: {content: '<span>Ghana</span><br />Sales: $ 11773600'}
            },
            'GR': {
                value: 5370132, href: '',
                tooltip: {content: '<span>Greece</span><br />Sales: $ 5370100'}
            },
            'GD': {
                value: 47715821, href: '',
                tooltip: {content: '<span>Grenada</span><br />Sales: $ 47715800'}
            },
            'GT': {
                value: 1491110, href: '',
                tooltip: {content: '<span>Guatemala</span><br />Sales: $ 1491100'}
            },
            'GN': {
                value: 38586774, href: '',
                tooltip: {content: '<span>Guinea</span><br />Sales: $ 38586700'}
            },
            'GQ': {
                value: 11621902, href: '',
                tooltip: {content: '<span>Equatorial Guinea</span><br />Sales: $ 11621900'}
            },
            'GW': {
                value: 14102502, href: '',
                tooltip: {content: '<span>Guinea-bissau</span><br />Sales: $ 14102500'}
            },
            'GY': {
                value: 40208212, href: '',
                tooltip: {content: '<span>Guyana</span><br />Sales: $ 40208200'}
            },
            'HT': {
                value: 39544647, href: '',
                tooltip: {content: '<span>Haiti</span><br />Sales: $ 39544600'}
            },
            'HN': {
                value: 14948868, href: '',
                tooltip: {content: '<span>Honduras</span><br />Sales: $ 14948800'}
            },
            'HU': {
                value: 21085473, href: '',
                tooltip: {content: '<span>Hungary</span><br />Sales: $ 21085400'}
            },
            'JM': {
                value: 11420822, href: '',
                tooltip: {content: '<span>Jamaica</span><br />Sales: $ 11420800'}
            },
            'JP': {
                value: 50212873, href: '',
                tooltip: {content: '<span>Japan</span><br />Sales: $ 50212800'}
            },
            'MH': {
                value: 58404154, href: '',
                tooltip: {content: '<span>Marshall Islands</span><br />Sales: $ 58404100'}
            },
            'PW': {
                value: 29355359, href: '',
                tooltip: {content: '<span>Palau</span><br />Sales: $ 29355300'}
            },
            'SB': {
                value: 3107064, href: '',
                tooltip: {content: '<span>Solomon Islands</span><br />Sales: $ 3107000'}
            },
            'IN': {
                value: 16307074, href: '',
                tooltip: {content: '<span>India</span><br />Sales: $ 16307000'}
            },
            'ID': {
                value: 35290884, href: '',
                tooltip: {content: '<span>Indonesia</span><br />Sales: $ 35290800'}
            },
            'JO': {
                value: 29552783, href: '',
                tooltip: {content: '<span>Jordan</span><br />Sales: $ 29552700'}
            },
            'IR': {
                value: 13395065, href: '',
                tooltip: {content: '<span>Iran, Islamic Republic Of</span><br />Sales: $ 13395000'}
            },
            'IQ': {
                value: 33292877, href: '',
                tooltip: {content: '<span>Iraq</span><br />Sales: $ 33292800'}
            },
            'IE': {
                value: 48562186, href: '',
                tooltip: {content: '<span>Ireland</span><br />Sales: $ 48562100'}
            },
            'IS': {
                value: 42268372, href: '',
                tooltip: {content: '<span>Iceland</span><br />Sales: $ 42268300'}
            },
            'IL': {
                value: 10462948, href: '',
                tooltip: {content: '<span>Israel</span><br />Sales: $ 10462900'}
            },
            'IT': {
                value: 46885907, href: '',
                tooltip: {content: '<span>Italy</span><br />Sales: $ 46885900'}
            },
            'KZ': {
                value: 51421183, href: '',
                tooltip: {content: '<span>Kazakhstan</span><br />Sales: $ 51421100'}
            },
            'KE': {
                value: 58142749, href: '',
                tooltip: {content: '<span>Kenya</span><br />Sales: $ 58142700'}
            },
            'KG': {
                value: 52338840, href: '',
                tooltip: {content: '<span>Kyrgyzstan</span><br />Sales: $ 52338800'}
            },
            'KI': {
                value: 32751788, href: '',
                tooltip: {content: '<span>Kiribati</span><br />Sales: $ 32751700'}
            },
            'KW': {
                value: 27020999, href: '',
                tooltip: {content: '<span>Kuwait</span><br />Sales: $ 27020900'}
            },
            'LA': {
                value: 37866541, href: '',
                tooltip: {content: '<span>Lao People\'s Democratic Republic</span><br />Sales: $ 37866500'}
            },
            'LS': {
                value: 47300864, href: '',
                tooltip: {content: '<span>Lesotho</span><br />Sales: $ 47300800'}
            },
            'LV': {
                value: 56406147, href: '',
                tooltip: {content: '<span>Latvia</span><br />Sales: $ 56406100'}
            },
            'LB': {
                value: 48364762, href: '',
                tooltip: {content: '<span>Lebanon</span><br />Sales: $ 48364700'}
            },
            'LR': {
                value: 31980371, href: '',
                tooltip: {content: '<span>Liberia</span><br />Sales: $ 31980300'}
            },
            'LY': {
                value: 53377146, href: '',
                tooltip: {content: '<span>Libya</span><br />Sales: $ 53377100'}
            },
            'LI': {
                value: 33614606, href: '',
                tooltip: {content: '<span>Liechtenstein</span><br />Sales: $ 33614600'}
            },
            'LT': {
                value: 38705594, href: '',
                tooltip: {content: '<span>Lithuania</span><br />Sales: $ 38705500'}
            },
            'LU': {
                value: 1174865, href: '',
                tooltip: {content: '<span>Luxembourg</span><br />Sales: $ 1174800'}
            },
            'MK': {
                value: 38745810, href: '',
                tooltip: {content: '<span>Macedonia, The Former Yugoslav Republic Of</span><br />Sales: $ 38745800'}
            },
            'MG': {
                value: 29892792, href: '',
                tooltip: {content: '<span>Madagascar</span><br />Sales: $ 29892700'}
            },
            'MY': {
                value: 11146621, href: '',
                tooltip: {content: '<span>Malaysia</span><br />Sales: $ 11146600'}
            },
            'MW': {
                value: 55890650, href: '',
                tooltip: {content: '<span>Malawi</span><br />Sales: $ 55890600'}
            },
            'MV': {
                value: 1534982, href: '',
                tooltip: {content: '<span>Maldives</span><br />Sales: $ 1534900'}
            },
            'ML': {
                value: 20906329, href: '',
                tooltip: {content: '<span>Mali</span><br />Sales: $ 20906300'}
            },
            'MT': {
                value: 8740969, href: '',
                tooltip: {content: '<span>Malta</span><br />Sales: $ 8740900'}
            },
            'MA': {
                value: 37018347, href: '',
                tooltip: {content: '<span>Morocco</span><br />Sales: $ 37018300'}
            },
            'MU': {
                value: 29722787, href: '',
                tooltip: {content: '<span>Mauritius</span><br />Sales: $ 29722700'}
            },
            'MR': {
                value: 12270843, href: '',
                tooltip: {content: '<span>Mauritania</span><br />Sales: $ 12270800'}
            },
            'MX': {
                value: 44591764, href: '',
                tooltip: {content: '<span>Mexico</span><br />Sales: $ 44591700'}
            },
            'FM': {
                value: 54998584, href: '',
                tooltip: {content: '<span>Micronesia, Federated States Of</span><br />Sales: $ 54998500'}
            },
            'MD': {
                value: 1637350, href: '',
                tooltip: {content: '<span>Moldova, Republic Of</span><br />Sales: $ 1637300'}
            },
            'MC': {
                value: 39551959, href: '',
                tooltip: {content: '<span>Monaco</span><br />Sales: $ 39551900'}
            },
            'MN': {
                value: 41952127, href: '',
                tooltip: {content: '<span>Mongolia</span><br />Sales: $ 41952100'}
            },
            'ME': {
                value: 10621985, href: '',
                tooltip: {content: '<span>Montenegro</span><br />Sales: $ 10621900'}
            },
            'MZ': {
                value: 5256796, href: '',
                tooltip: {content: '<span>Mozambique</span><br />Sales: $ 5256700'}
            },
            'NA': {
                value: 48465302, href: '',
                tooltip: {content: '<span>Namibia</span><br />Sales: $ 48465300'}
            },
            'NP': {
                value: 13925186, href: '',
                tooltip: {content: '<span>Nepal</span><br />Sales: $ 13925100'}
            },
            'NI': {
                value: 14329175, href: '',
                tooltip: {content: '<span>Nicaragua</span><br />Sales: $ 14329100'}
            },
            'NE': {
                value: 38709250, href: '',
                tooltip: {content: '<span>Niger</span><br />Sales: $ 38709200'}
            },
            'NG': {
                value: 14676495, href: '',
                tooltip: {content: '<span>Nigeria</span><br />Sales: $ 14676400'}
            },
            'NO': {
                value: 3564065, href: '',
                tooltip: {content: '<span>Norway</span><br />Sales: $ 3564000'}
            },
            'NZ': {
                value: 26810779, href: '',
                tooltip: {content: '<span>New Zealand</span><br />Sales: $ 26810700'}
            },
            'OM': {
                value: 10272836, href: '',
                tooltip: {content: '<span>Oman</span><br />Sales: $ 10272800'}
            },
            'UG': {
                value: 3701165, href: '',
                tooltip: {content: '<span>Uganda</span><br />Sales: $ 3701100'}
            },
            'UZ': {
                value: 23971890, href: '',
                tooltip: {content: '<span>Uzbekistan</span><br />Sales: $ 23971800'}
            },
            'PK': {
                value: 38707422, href: '',
                tooltip: {content: '<span>Pakistan</span><br />Sales: $ 38707400'}
            },
            'PS': {
                value: 37875681, href: '',
                tooltip: {content: '<span>Palestine, State Of</span><br />Sales: $ 37875600'}
            },
            'PA': {
                value: 51104938, href: '',
                tooltip: {content: '<span>Panama</span><br />Sales: $ 51104900'}
            },
            'PG': {
                value: 58301786, href: '',
                tooltip: {content: '<span>Papua New Guinea</span><br />Sales: $ 58301700'}
            },
            'PY': {
                value: 10709729, href: '',
                tooltip: {content: '<span>Paraguay</span><br />Sales: $ 10709700'}
            },
            'NL': {
                value: 29795908, href: '',
                tooltip: {content: '<span>Netherlands</span><br />Sales: $ 29795900'}
            },
            'PE': {
                value: 42703436, href: '',
                tooltip: {content: '<span>Peru</span><br />Sales: $ 42703400'}
            },
            'PH': {
                value: 59756876, href: '',
                tooltip: {content: '<span>Philippines</span><br />Sales: $ 59756800'}
            },
            'PL': {
                value: 53258326, href: '',
                tooltip: {content: '<span>Poland</span><br />Sales: $ 53258300'}
            },
            'PT': {
                value: 44061643, href: '',
                tooltip: {content: '<span>Portugal</span><br />Sales: $ 44061600'}
            },
            'QA': {
                value: 14062286, href: '',
                tooltip: {content: '<span>Qatar</span><br />Sales: $ 14062200'}
            },
            'DO': {
                value: 11490286, href: '',
                tooltip: {content: '<span>Dominican Republic</span><br />Sales: $ 11490200'}
            },
            'RO': {
                value: 7243835, href: '',
                tooltip: {content: '<span>Romania</span><br />Sales: $ 7243800'}
            },
            'GB': {
                value: 48851010, href: '',
                tooltip: {content: '<span>United Kingdom</span><br />Sales: $ 48851000'}
            },
            'RU': {
                value: 30697113, href: '',
                tooltip: {content: '<span>Russian Federation</span><br />Sales: $ 30697100'}
            },
            'RW': {
                value: 46405142, href: '',
                tooltip: {content: '<span>Rwanda</span><br />Sales: $ 46405100'}
            },
            'KN': {
                value: 43006885, href: '',
                tooltip: {content: '<span>Saint Kitts And Nevis</span><br />Sales: $ 43006800'}
            },
            'SM': {
                value: 42292136, href: '',
                tooltip: {content: '<span>San Marino</span><br />Sales: $ 42292100'}
            },
            'VC': {
                value: 8373541, href: '',
                tooltip: {content: '<span>Saint Vincent And The Grenadines</span><br />Sales: $ 8373500'}
            },
            'LC': {
                value: 27854568, href: '',
                tooltip: {content: '<span>Saint Lucia</span><br />Sales: $ 27854500'}
            },
            'SV': {
                value: 1438098, href: '',
                tooltip: {content: '<span>El Salvador</span><br />Sales: $ 1438000'}
            },
            'WS': {
                value: 52463144, href: '',
                tooltip: {content: '<span>Samoa</span><br />Sales: $ 52463100'}
            },
            'ST': {
                value: 12607196, href: '',
                tooltip: {content: '<span>Sao Tome And Principe</span><br />Sales: $ 12607100'}
            },
            'SN': {
                value: 28841690, href: '',
                tooltip: {content: '<span>Senegal</span><br />Sales: $ 28841600'}
            },
            'RS': {
                value: 52878101, href: '',
                tooltip: {content: '<span>Serbia</span><br />Sales: $ 52878100'}
            },
            'SC': {
                value: 17592160, href: '',
                tooltip: {content: '<span>Seychelles</span><br />Sales: $ 17592100'}
            },
            'SL': {
                value: 19063702, href: '',
                tooltip: {content: '<span>Sierra Leone</span><br />Sales: $ 19063700'}
            },
            'SG': {
                value: 32519632, href: '',
                tooltip: {content: '<span>Singapore</span><br />Sales: $ 32519600'}
            },
            'SK': {
                value: 38217517, href: '',
                tooltip: {content: '<span>Slovakia</span><br />Sales: $ 38217500'}
            },
            'SI': {
                value: 25657309, href: '',
                tooltip: {content: '<span>Slovenia</span><br />Sales: $ 25657300'}
            },
            'SO': {
                value: 33358685, href: '',
                tooltip: {content: '<span>Somalia</span><br />Sales: $ 33358600'}
            },
            'SD': {
                value: 51991520, href: '',
                tooltip: {content: '<span>Sudan</span><br />Sales: $ 51991500'}
            },
            'SS': {
                value: 7996972, href: '',
                tooltip: {content: '<span>South Sudan</span><br />Sales: $ 7996900'}
            },
            'LK': {
                value: 14886715, href: '',
                tooltip: {content: '<span>Sri Lanka</span><br />Sales: $ 14886700'}
            },
            'SE': {
                value: 31157770, href: '',
                tooltip: {content: '<span>Sweden</span><br />Sales: $ 31157700'}
            },
            'CH': {
                value: 10510476, href: '',
                tooltip: {content: '<span>Switzerland</span><br />Sales: $ 10510400'}
            },
            'SR': {
                value: 42707092, href: '',
                tooltip: {content: '<span>Suriname</span><br />Sales: $ 42707000'}
            },
            'SZ': {
                value: 13358505, href: '',
                tooltip: {content: '<span>Swaziland</span><br />Sales: $ 13358500'}
            },
            'SY': {
                value: 18076581, href: '',
                tooltip: {content: '<span>Syrian Arab Republic</span><br />Sales: $ 18076500'}
            },
            'TJ': {
                value: 40979630, href: '',
                tooltip: {content: '<span>Tajikistan</span><br />Sales: $ 40979600'}
            },
            'TZ': {
                value: 13188501, href: '',
                tooltip: {content: '<span>Tanzania, United Republic Of</span><br />Sales: $ 13188500'}
            },
            'TD': {
                value: 19200802, href: '',
                tooltip: {content: '<span>Chad</span><br />Sales: $ 19200800'}
            },
            'CZ': {
                value: 29680743, href: '',
                tooltip: {content: '<span>Czech Republic</span><br />Sales: $ 29680700'}
            },
            'TH': {
                value: 6752102, href: '',
                tooltip: {content: '<span>Thailand</span><br />Sales: $ 6752100'}
            },
            'TL': {
                value: 59831824, href: '',
                tooltip: {content: '<span>Timor-leste</span><br />Sales: $ 59831800'}
            },
            'TG': {
                value: 591732, href: '',
                tooltip: {content: '<span>Togo</span><br />Sales: $ 591700'}
            },
            'TO': {
                value: 11685882, href: '',
                tooltip: {content: '<span>Tonga</span><br />Sales: $ 11685800'}
            },
            'TT': {
                value: 40731021, href: '',
                tooltip: {content: '<span>Trinidad And Tobago</span><br />Sales: $ 40731000'}
            },
            'TN': {
                value: 53477686, href: '',
                tooltip: {content: '<span>Tunisia</span><br />Sales: $ 53477600'}
            },
            'TM': {
                value: 15559421, href: '',
                tooltip: {content: '<span>Turkmenistan</span><br />Sales: $ 15559400'}
            },
            'TR': {
                value: 5955762, href: '',
                tooltip: {content: '<span>Turkey</span><br />Sales: $ 59557600'}
            },
            'TV': {
                value: 6269509, href: '',
                tooltip: {content: '<span>Tuvalu</span><br />Sales: $ 6269500'}
            },
            'VU': {
                value: 14716711, href: '',
                tooltip: {content: '<span>Vanuatu</span><br />Sales: $ 14716700'}
            },
            'VE': {
                value: 32281992, href: '',
                tooltip: {content: '<span>Venezuela, Bolivarian Republic Of</span><br />Sales: $ 32281900'}
            },
            'VN': {
                value: 59111591, href: '',
                tooltip: {content: '<span>Viet Nam</span><br />Sales: $ 59111500'}
            },
            'UA': {
                value: 36270694, href: '',
                tooltip: {content: '<span>Ukraine</span><br />Sales: $ 36270600'}
            },
            'UY': {
                value: 53989527, href: '',
                tooltip: {content: '<span>Uruguay</span><br />Sales: $ 53989500'}
            },
            'YE': {
                value: 48887571, href: '',
                tooltip: {content: '<span>Yemen</span><br />Sales: $ 48887500'}
            },
            'ZM': {
                value: 45913410, href: '',
                tooltip: {content: '<span>Zambia</span><br />Sales: $ 45913400'}
            },
            'ZW': {
                value: 53987699, href: '',
                tooltip: {content: '<span>Zimbabwe</span><br />Sales: $ 53987600'}
            }
        },
    });
});
