
const { Form, Field, ErrorMessage, defineRule, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');
configure({ generateMessage: localize('zh_TW'), });

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'yuchi-hexschool';

Vue.createApp({
    data() {
        return {
            products: [],
            productId: '',
            cartData: [],
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            },
            cartData: {
                carts: [],
            },
            isLoading: '',
        }
    },
    components: {
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
    },
    methods: {
        getProducts() {
            const url = `${apiUrl}/api/${apiPath}/products/all`;
            axios.get(url)
                .then(res => {
                    this.products = res.data.products;
                });
        },
        openProductModal(id) {
            this.productId = id;
            this.$refs.productModal.openProductModal();
        },
        getCart() {
            const url = `${apiUrl}/api/${apiPath}/cart`;

            axios.get(url)
                .then(res => {
                    this.cartData = res.data.data;
                });
        },
        addToCart(id, qty = 1) {
            const data = {
                product_id: id,
                qty
            };
            const url = `${apiUrl}/api/${apiPath}/cart`;

            this.isLoading = id;
            axios.post(url,{ data })
                .then(res => {
                    alert(res.data.message);
                    this.getCart();
                    this.$refs.productModal.closeProductModal();
                    this.isLoading = ''; // 清空
                });
        },
        deleteAllCarts() {
            const url = `${apiUrl}/api/${apiPath}/carts`;
            
            axios.delete(url)
                .then(res => {
                    alert(res.data.message);
                    this.getCart();
                });
        },
        deleteCartItem(id) {
            const url = `${apiUrl}/api/${apiPath}/cart/${id}`;

            this.isLoading = id;
            axios.delete(url)
                .then(res => {
                    alert(res.data.message);
                    this.getCart();
                    this.isLoading = ''; // 清空
                });
        },
        updateCartItem(item) {
            const data = {
                product_id: item.id,
                qty: item.qty
            };
            const url = `${apiUrl}/api/${apiPath}/cart/${item.id}`;

            this.isLoading = item.id;
            axios.put(url,{ data })
                .then(res => {
                    this.getCart();
                    this.isLoading = ''; // 清空
                });
        },
        sendOrder() {
            const url = `${apiUrl}/api/${apiPath}/order`;
            const order = this.form
            axios.post(url,{ data: order })
                .then(res => {
                    alert(res.data.message);
                    this.$refs.form.resetForm();
                    this.getCart();
                }).catch((err) => {
                    alert(err.data.message);
                });
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    }
}).component('product-modal', {
    data() {
        return {
            product: {},
            productModal: {},
            qty: 1,
        }
    },
    props: ['id'],
    watch: {
        id() {
            this.getProduct();
        }
    },
    template: `
    <div class="modal fade" id="productModal" tabindex="-1" ref="modal">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title">商品說明</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-product-content modal-body">
                    <div class="row">
                        <div class="col-5">
                            <div class="product-img">
                                <img :src="product.imageUrl" class="img-fluid" alt="">
                            </div>
                        </div>
                        <div class="col-7">
                            <div class="product-content">
                                <h2 class="fw-bold">{{ product.title }}</h2>
                                <div class="product-category mb-3">{{ product.category }}</div>
                                <div class="p-product-description mb-3">{{ product.description }}</div>
                                <div v-if="product.price === product.origin_price" class="card-text mb-3">
                                    <div class="fw-bold"><small>售價 $</small> {{ product.origin_price }}</div>
                                </div>
                                <div v-else class="card-text mb-3 d-flex">
                                    <div class="text-danger fw-bold me-2"><small>特價 $</small> {{ product.price }}</div>
                                    <div class="text-decoration-line-through fw-bold text-black-50"><small>售價 $</small> {{ product.origin_price }}</div>
                                </div>
                                
                                <div class="mb-3">
                                    <select class="form-select" name="productItemQty" id="productItemQty" v-model="qty">
                                        <option v-for="num in 10" :value="num" :key="'product.id' + 'num'">
                                            {{ num }}
                                        </option>
                                    </select>
                                </div>
                                <button class="btn btn-dark w-100" 
                                @click="addToCart">放入購物車</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    methods: {
        openProductModal() {
            this.productModal.show();
        },
        closeProductModal() {
            this.productModal.hide();
        },
        getProduct() {
            let url = `${apiUrl}/api/${apiPath}/product/${this.id}`;
            
            axios.get(url)
            .then(res => {
                this.product = res.data.product;
            })
        },
        addToCart() {
            this.$emit('add-cart', this.product.id, this.qty);
        },
    },
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal);
    }
}).mount('#app');